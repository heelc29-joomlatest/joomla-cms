import { TOTP } from 'totp-generator';

describe('Test in backend that the user', () => {
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
    cy.doAdministratorLogin();
    cy.visit('/administrator/index.php?option=com_users&view=users');
    cy.get('.header-profile:visible').click();
    cy.get('.header-profile a.dropdown-item').contains('Edit Account').click();
    cy.get('#myTab div[role="tablist"] button[aria-controls="multifactorauth"]').click();
    cy.get('.com-users-methods-list-method-name-webauthn a.com-users-methods-list-method-addnew').click();
    cy.get('#com-users-method-edit-title').clear().type('Test Passkey');
    cy.get('#toolbar-user-mfa-edit-save').click();
    cy.get('.com-users-methods-list-method-name-webauthn .com-users-methods-list-method-record').contains('Test Passkey');
    cy.clickToolbarButton('Cancel');
    cy.doAdministratorLogout();
    cy.get('#mod-login-username').type(Cypress.expose('username'));
    cy.get('#mod-login-password').type(Cypress.expose('password'));
    cy.get('#form-login').submit();
    cy.get('#users-mfa-title').contains('Passkey');
    cy.get('#toolbar-user-mfa-submit').click();
    cy.visit('/administrator/index.php?option=com_users&view=users');
    cy.get('.header-profile:visible').click();
    cy.get('.header-profile a.dropdown-item').contains('Edit Account').click();
    cy.get('#myTab div[role="tablist"] button[aria-controls="multifactorauth"]').click();
    cy.get('#com-users-methods-reset-message').contains('is enabled');
    cy.get('.com-users-methods-list-method-name-webauthn a.com-users-methods-list-method-record-delete').click();
    cy.on('window:confirm', (text) => expect(text).to.contains('Are you sure you want to delete?'));
    cy.get('#com-users-methods-reset-message').contains('not enabled');
    cy.then(() => Cypress.automation('remote:debugger:protocol', { command: 'WebAuthn.disable', params: {} }));
  });
});
