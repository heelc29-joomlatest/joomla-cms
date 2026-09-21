import { TOTP } from 'totp-generator';

describe('Test in frontend that the user', () => {
  afterEach(() => cy.db_getUserId().then((uid) => cy.task('queryDB', `DELETE FROM #__user_mfa WHERE user_id = ${uid}`)));

  it('can login with Multi-factor Authentication (passkey)', { browser: '!firefox' }, () => {
    Cypress.automation('remote:debugger:protocol', { command: 'WebAuthn.enable', params: {} }).then(() => {
      Cypress.automation('remote:debugger:protocol', {
        command: 'WebAuthn.addVirtualAuthenticator',
        params: {
          options: {
            protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true,
          },
        },
      });
    });
    cy.doFrontendLogin();
    cy.visit('/index.php?option=com_users&view=profile&layout=edit');
    cy.get('.com-users-methods-list-method-name-webauthn a.com-users-methods-list-method-addnew').click();
    cy.get('#com-users-method-edit-title').clear().type('Test Passkey');
    cy.get('#com-users-method-edit button.multifactorauth_webauthn_setup').click();
    cy.get('.com-users-methods-list-method-name-webauthn .com-users-methods-list-method-record').contains('Test Passkey');
    cy.doFrontendLogout();
    cy.get('form.mod-login input[name="username"]').type(Cypress.expose('username'));
    cy.get('form.mod-login input[name="password"]').type(Cypress.expose('password'));
    cy.get('form.mod-login').submit();
    cy.get('#users-mfa-title').contains('Passkey');
    cy.get('#users-mfa-captive-button-submit').click();
    cy.visit('/index.php?option=com_users&view=profile&layout=edit');
    cy.get('#com-users-methods-reset-message').contains('is enabled');
    cy.get('.com-users-methods-list-method-name-webauthn a.com-users-methods-list-method-record-delete').click();
    cy.on('window:confirm', (text) => expect(text).to.contains('Are you sure you want to delete?'));
    cy.get('#com-users-methods-reset-message').contains('not enabled');
    cy.then(() => Cypress.automation('remote:debugger:protocol', { command: 'WebAuthn.disable', params: {} }));
  });
});
