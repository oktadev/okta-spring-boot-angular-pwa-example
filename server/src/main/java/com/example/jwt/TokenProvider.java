package com.example.jwt;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.*;
import java.util.stream.Collectors;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.jose4j.jwk.HttpsJwks;
import org.jose4j.jws.JsonWebSignature;
import org.jose4j.jwt.JwtClaims;
import org.jose4j.jwt.MalformedClaimException;
import org.jose4j.jwt.consumer.InvalidJwtException;
import org.jose4j.jwt.consumer.JwtConsumer;
import org.jose4j.jwt.consumer.JwtConsumerBuilder;
import org.jose4j.jwt.consumer.JwtContext;
import org.jose4j.keys.resolvers.HttpsJwksVerificationKeyResolver;
import org.jose4j.lang.JoseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;

@Component
public class TokenProvider {

    private final Logger log = LoggerFactory.getLogger(TokenProvider.class);

    private static final String AUTHORITIES_KEY = "scp";

    public Authentication getAuthentication(String token) {
        Map<String, Object> claims = decodeJwt(token);

        String scopes = claims.get(AUTHORITIES_KEY).toString();
        scopes = scopes.substring(1, scopes.length() - 1).replace(" ", "");

        Collection<? extends GrantedAuthority> authorities =
                Arrays.stream(scopes.split(","))
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());

        User principal = new User(claims.get("sub").toString(), "", authorities);
        return new UsernamePasswordAuthenticationToken(principal, token, authorities);
    }

    public boolean validateToken(String authToken) {
        return decodeJwt(authToken) != null;
    }

    /**
     * Decode and verify JWT token using jose4j JWT library
     *
     * @param jwt
     * @return
     */
    public Map<String, Object> decodeJwt(String jwt) {
        // Create a new JsonWebSignature
        JsonWebSignature jws = new JsonWebSignature();
        try {
            jws.setCompactSerialization(jwt);
        } catch (JoseException e) {
            e.printStackTrace();
        }

        // Build a JwtConsumer that doesn't check signatures or do any validation.
        JwtConsumer firstPassJwtConsumer = new JwtConsumerBuilder()
                .setSkipAllValidators()
                .setDisableRequireSignature()
                .setSkipSignatureVerification()
                .build();

        //The first JwtConsumer is basically just used to parse the JWT into a JwtContext object.
        JwtContext jwtContext = null;
        try {
            jwtContext = firstPassJwtConsumer.process(jwt);
        } catch (InvalidJwtException e) {
            log.error(e.getMessage());
        }
        // From the JwtContext we can get the issuer, or whatever else we might need,
        // to lookup or figure out the kind of validation policy to apply
        String issuer = null;
        try {
            issuer = jwtContext.getJwtClaims().getIssuer();
        } catch (MalformedClaimException e) {
            log.error(e.getMessage());
        }

        ObjectMapper mapper = new ObjectMapper();
        Map discoveryDoc = new HashMap<String, Object>();

        // Convert JSON string to Map
        try {
            discoveryDoc = mapper.readValue(getDiscoveryDocument("https://dev-158606.oktapreview.com"),
                    new TypeReference<Map<String, Object>>() {
                    });
        } catch (IOException e) {
            log.error(e.getMessage());
        }

        Object jwksUri = discoveryDoc.get("jwks_uri");
        HttpsJwks httpsJwks = new HttpsJwks(jwksUri.toString());
        HttpsJwksVerificationKeyResolver httpsJwksKeyResolver = new HttpsJwksVerificationKeyResolver(httpsJwks);

        JwtConsumer secondPassJwtConsumer = new JwtConsumerBuilder()
                .setExpectedIssuer(issuer)
                .setVerificationKeyResolver(httpsJwksKeyResolver)
                .setRequireExpirationTime()
                .setAllowedClockSkewInSeconds(30)
                .setRequireSubject()
                .setExpectedAudience("https://dev-158606.oktapreview.com")
                .build();

        try {
            secondPassJwtConsumer.processContext(jwtContext);
            return secondPassJwtConsumer.processToClaims(jwt).getClaimsMap();
        } catch (InvalidJwtException e) {
            log.error(e.getMessage());
        }
        return null;
    }

    public static String getDiscoveryDocument(String issuer) {
        HttpURLConnection connection = null;

        try {
            //Create connection
            URL url = new URL(issuer + "/.well-known/openid-configuration");
            connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");

            //Get Response from Discovery URL
            BufferedReader rd = new BufferedReader(new InputStreamReader(connection.getInputStream()));
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = rd.readLine()) != null) {
                response.append(line);
                response.append('\r');

            }
            rd.close();
            return response.toString();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }
}
