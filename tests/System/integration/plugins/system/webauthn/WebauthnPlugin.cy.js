describe('Test that the webauthn system plugin', { browser: '!firefox' }, () => {
  let authenticatorId;

  beforeEach(() => {
    return cy.webauthn_enable()
      .then(() => cy.webauthn_addAuthenticator())
      .then((id) => { authenticatorId = id; });
  });
  afterEach(() => {
    return cy.db_updateExtensionParameter('attestationSupport', '0', 'plg_system_webauthn')
      .then(() => cy.webauthn_disable());
  });

  it('can use passkeys in frontend', () => {
    let storedCredential;
    cy.doFrontendLogin();
    cy.visit('/index.php?option=com_users&view=profile');
    cy.get('#users-profile-custom-webauthn').contains('Passkey Login');
    cy.get('.com-users-profile__edit.btn-toolbar').contains('Edit Profile').click();
    cy.get('#plg_system_webauthn-manage-add').click();
    cy.get('#plg_system_webauthn-management-interface table tbody tr').contains('Generic Passkey');
    cy.get('.plg_system_webauthn-manage-edit').contains('Edit Name').click();
    cy.get('.webauthnManagementEditorRow input').clear().type('Test Passkey');
    cy.get('.webauthnManagementEditorRow button').contains('Save').click();
    cy.webauthn_getCredentials(authenticatorId).as('webauthnCredentials1');
    cy.get('@webauthnCredentials1').should('have.length', 1);
    cy.get('@webauthnCredentials1').its('0.signCount').should('equal', 1);
    cy.get('@webauthnCredentials1').its('0.userDisplayName').should('equal', Cypress.expose('name'));
    cy.get('@webauthnCredentials1').its('0.userName').should('equal', Cypress.expose('username'));
    cy.get('@webauthnCredentials1').then((credentials) => {
      const { credentialId, userHandle } = credentials[0];
      cy.task('queryDB', `SELECT * FROM #__webauthn_credentials WHERE id='${credentialId}' AND user_id='${atob(userHandle)}'`).then((data) => {
        cy.wrap(data).should('have.length', 1);
        storedCredential = data[0];
      });
    });
    cy.doFrontendLogout();
    cy.db_updateExtensionParameter('attestationSupport', '1', 'plg_system_webauthn');
    cy.visit('index.php?option=com_users&view=login');
    cy.get('form.mod-login input[name="username"]').type(Cypress.expose('username'));
    cy.get('.mod-login .plg_system_webauthn_login_button').contains('Sign in with a passkey').click();
    cy.get('.mod-login-logout button[type=submit]').should('exist').should('contain', 'Log out');
    cy.webauthn_getCredentials(authenticatorId).as('webauthnCredentials2');
    cy.get('@webauthnCredentials2').should('have.length', 1);
    cy.get('@webauthnCredentials2').its('0.signCount').should('equal', 2);
    cy.get('@webauthnCredentials2').then((credentials) => {
      const { credentialId, userHandle } = credentials[0];
      expect(credentialId).to.equal(storedCredential.id);
      cy.task('queryDB', `SELECT * FROM #__webauthn_credentials WHERE id='${credentialId}' AND user_id='${atob(userHandle)}'`).then((data) => {
        cy.wrap(data).should('have.length', 1);
        expect(data[0].id).to.equal(storedCredential.id);
        expect(data[0].user_id).to.equal(storedCredential.user_id);
        expect(data[0].credential).to.not.equal(storedCredential.credential);
      });
    });
    cy.visit('/index.php?option=com_users&view=profile');
    cy.get('.com-users-profile__edit.btn-toolbar').contains('Edit Profile').click();
    cy.get('#plg_system_webauthn-management-interface table img').should('be.visible');
    cy.get('.plg_system_webauthn-manage-delete').contains('Remove').click();
    cy.get('.plg_system_webauthn-manage-delete').should('not.exist');
  });

  it('can use passkeys in backend', () => {
    let storedCredential;
    cy.doAdministratorLogin(null, null, false);
    cy.visit('/administrator/index.php?option=com_users&view=users');
    cy.get('.header-profile:visible').click();
    cy.get('.header-profile a.dropdown-item').contains('Edit Account').click();
    cy.get('#myTab div[role="tablist"] button[aria-controls="attrib-webauthn"]').contains('Passkey Login').click();
    cy.get('#plg_system_webauthn-manage-add').click();
    cy.get('#plg_system_webauthn-management-interface table tbody tr').contains('Generic Passkey');
    cy.get('.plg_system_webauthn-manage-edit').contains('Edit Name').click();
    cy.get('.webauthnManagementEditorRow input').clear().type('Test Passkey');
    cy.get('.webauthnManagementEditorRow button').contains('Save').click();
    cy.webauthn_getCredentials(authenticatorId).as('webauthnCredentials1');
    cy.get('@webauthnCredentials1').should('have.length', 1);
    cy.get('@webauthnCredentials1').its('0.signCount').should('equal', 1);
    cy.get('@webauthnCredentials1').its('0.userDisplayName').should('equal', Cypress.expose('name'));
    cy.get('@webauthnCredentials1').its('0.userName').should('equal', Cypress.expose('username'));
    cy.get('@webauthnCredentials1').then((credentials) => {
      const { credentialId, userHandle } = credentials[0];
      cy.task('queryDB', `SELECT * FROM #__webauthn_credentials WHERE id='${credentialId}' AND user_id='${atob(userHandle)}'`).then((data) => {
        cy.wrap(data).should('have.length', 1);
        storedCredential = data[0];
      });
    });
    cy.clickToolbarButton('Cancel');
    cy.doAdministratorLogout();
    cy.db_updateExtensionParameter('attestationSupport', '1', 'plg_system_webauthn');
    cy.get('#mod-login-username').type(Cypress.expose('username'));
    cy.get('#form-login .plg_system_webauthn_login_button').contains('Sign in with a passkey').click();
    cy.get('h1.page-title').should('contain', 'Home Dashboard');
    cy.webauthn_getCredentials(authenticatorId).as('webauthnCredentials2');
    cy.get('@webauthnCredentials2').should('have.length', 1);
    cy.get('@webauthnCredentials2').its('0.signCount').should('equal', 2);
    cy.get('@webauthnCredentials2').then((credentials) => {
      const { credentialId, userHandle } = credentials[0];
      expect(credentialId).to.equal(storedCredential.id);
      cy.task('queryDB', `SELECT * FROM #__webauthn_credentials WHERE id='${credentialId}' AND user_id='${atob(userHandle)}'`).then((data) => {
        cy.wrap(data).should('have.length', 1);
        expect(data[0].id).to.equal(storedCredential.id);
        expect(data[0].user_id).to.equal(storedCredential.user_id);
        expect(data[0].credential).to.not.equal(storedCredential.credential);
      });
    });
    cy.visit('/administrator/index.php?option=com_users&view=users');
    cy.get('.header-profile:visible').click();
    cy.get('.header-profile a.dropdown-item').contains('Edit Account').click();
    cy.get('#myTab div[role="tablist"] button[aria-controls="attrib-webauthn"]').contains('Passkey Login').click();
    cy.get('#plg_system_webauthn-management-interface table img').should('be.visible');
    cy.get('.plg_system_webauthn-manage-delete').contains('Remove').click();
    cy.get('.plg_system_webauthn-manage-delete').should('not.exist');
  });

  it('can delete passkeys when the user is deleted', () => {
    let webauthnCredentials;
    cy.db_createUser({ name: 'test user', email: 'test@example.com' });
    cy.doFrontendLogin('test', 'test', null);
    cy.visit('/index.php?option=com_users&view=profile');
    cy.get('#users-profile-custom-webauthn').contains('Passkey Login');
    cy.get('.com-users-profile__edit.btn-toolbar').contains('Edit Profile').click();
    cy.get('#plg_system_webauthn-manage-add').click();
    cy.get('#plg_system_webauthn-management-interface table tbody tr').contains('Generic Passkey');
    cy.task('queryDB', 'SELECT * FROM #__webauthn_credentials').then((data) => {
      webauthnCredentials = data.length;
    });
    cy.doAdministratorLogin();
    cy.visit('/administrator/index.php?option=com_users&view=users');
    cy.searchForItem('test user');
    cy.checkAllResults();
    cy.clickToolbarButton('Action');
    cy.contains('Delete').click();
    cy.clickDialogConfirm(true);
    cy.checkForSystemMessage('User deleted.');
    cy.task('queryDB', 'SELECT * FROM #__webauthn_credentials').then((data) => {
      expect(data.length).to.eq(webauthnCredentials - 1);
    });
  });
});
