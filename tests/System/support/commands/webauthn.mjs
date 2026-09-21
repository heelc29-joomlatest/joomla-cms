/**
 * Enable the WebAuthn domain in the browser's DevTools protocol.
 */
Cypress.Commands.add('webauthn_enable', () =>
  Cypress.automation('remote:debugger:protocol', { command: 'WebAuthn.enable', params: {} }),
);

/**
 * Disable the WebAuthn domain in the browser's DevTools protocol.
 */
Cypress.Commands.add('webauthn_disable', () =>
  Cypress.automation('remote:debugger:protocol', { command: 'WebAuthn.disable', params: {} }),
);

/**
 * Add a virtual WebAuthn authenticator and yield the authenticatorId.
 *
 * Default options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true }
 *
 * @param {object} [options={}] - Partial overrides for the defaults.
 * @returns {Promise<string>} resolves with the created authenticatorId
 */
Cypress.Commands.add('webauthn_addAuthenticator', (options = {}) => {
  const opts = {
    protocol: 'ctap2',
    transport: 'internal',
    hasResidentKey: true,
    hasUserVerification: true,
    isUserVerified: true,
    ...options,
  };

  return Cypress.automation('remote:debugger:protocol', {
    command: 'WebAuthn.addVirtualAuthenticator',
    params: { options: opts },
  }).then((res) => res.authenticatorId);
});
