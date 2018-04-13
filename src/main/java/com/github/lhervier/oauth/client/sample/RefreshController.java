package com.github.lhervier.oauth.client.sample;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RefreshController {

	@Autowired
	private TokensController tokensController;
	
	@GetMapping("/refresh")
	public TokensResponse refresh(Principal user) {
		// TODO: spring-oauth does not implement token refreshment...
		return this.tokensController.tokens();
	}
}
