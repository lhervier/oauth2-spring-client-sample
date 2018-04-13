package com.github.lhervier.oauth.client.sample;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.security.oauth2.client.EnableOAuth2Sso;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.oauth2.provider.token.AccessTokenConverter;
import org.springframework.security.oauth2.provider.token.DefaultAccessTokenConverter;
import org.springframework.security.oauth2.provider.token.ResourceServerTokenServices;

@Configuration
@EnableOAuth2Sso
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

	@Bean
	public AccessTokenConverter accessTokenConverter() {
		return new DefaultAccessTokenConverter();
	}
	
	@Bean
	public ResourceServerTokenServices remoteTokenServices(
			@Value("${security.oauth2.resource.tokenInfoUri}") String checkTokenUrl,
			@Value("${security.oauth2.resource.param:token}") String checkTokenParam,
			@Value("${security.oauth2.client.clientId}") String clientId,
			@Value("${security.oauth2.client.clientSecret}") String secret) {
		final IntrospectionEndpointTokenService remoteTokenServices = new IntrospectionEndpointTokenService();
		remoteTokenServices.setCheckTokenEndpointUrl(checkTokenUrl);
		remoteTokenServices.setTokenName(checkTokenParam);
		remoteTokenServices.setClientId(clientId);
		remoteTokenServices.setClientSecret(secret);
		remoteTokenServices.setAccessTokenConverter(accessTokenConverter());
		return remoteTokenServices;
	}
}
