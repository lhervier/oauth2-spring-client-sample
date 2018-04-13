package com.github.lhervier.oauth.client.sample;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.OAuth2ClientContext;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller to support the tokens and refresh endpoints
 * needed by ngOauth2AuthCodeFlow
 * @author Lionel HERVIER
 */
@RestController
public class TokensController {

	/**
	 * The OAuth2 client context
	 */
	@Autowired
	private OAuth2ClientContext ctx;
	
	/**
	 * Generate tokens
	 * @return
	 */
	@GetMapping("/tokens")
	public TokensResponse tokens() {
		TokensResponse ret = new TokensResponse();
		ret.setAccessToken(this.ctx.getAccessToken().getValue());
		ret.setTokenType(this.ctx.getAccessToken().getTokenType());
		ret.setScope(StringUtils.collectionToDelimitedString(this.ctx.getAccessToken().getScope(), " "));
		return ret;
	}
	
}
