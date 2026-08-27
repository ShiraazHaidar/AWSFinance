import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
} from "amazon-cognito-identity-js";

function getPoolConfig() {
  const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;

  if (!userPoolId || !clientId) {
    return null;
  }

  return {
    UserPoolId: userPoolId,
    ClientId: clientId,
  };
}

export function getConfigError() {
  const missing = [
    !import.meta.env.VITE_COGNITO_USER_POOL_ID && "VITE_COGNITO_USER_POOL_ID",
    !import.meta.env.VITE_COGNITO_CLIENT_ID && "VITE_COGNITO_CLIENT_ID",
  ].filter(Boolean) as string[];

  if (missing.length > 0) {
    return `Missing Cognito environment variables: ${missing.join(", ")}`;
  }

  return null;
}

export function getCurrentUser() {
  const poolConfig = getPoolConfig();

  if (!poolConfig) {
    return null;
  }

  const userPool = new CognitoUserPool(poolConfig);
  return userPool.getCurrentUser();
}

export function signOut() {
  const currentUser = getCurrentUser();
  currentUser?.signOut();
}

export function getCurrentSession() {
  return new Promise<any>((resolve, reject) => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      reject(new Error("No active Cognito session."));
      return;
    }

    currentUser.getSession((error: Error | null, session: any) => {
      if (error || !session || !session.isValid()) {
        reject(error ?? new Error("The Cognito session is invalid."));
        return;
      }

      resolve(session);
    });
  });
}

export function getIdToken() {
  return getCurrentSession().then((session) => session.getIdToken().getJwtToken());
}

export function signIn(username: string, password: string) {
  const poolConfig = getPoolConfig();
  const configError = getConfigError();

  if (!poolConfig) {
    throw new Error(configError ?? "Cognito configuration is missing.");
  }

  const userPool = new CognitoUserPool(poolConfig);
  const cognitoUser = new CognitoUser({
    Username: username,
    Pool: userPool,
  });

  return new Promise<
    | { user: CognitoUser; idToken: string }
    | { user: CognitoUser; requiresNewPassword: true }
  >((resolve, reject) => {
    cognitoUser.authenticateUser(
      new AuthenticationDetails({
        Username: username,
        Password: password,
      }),
      {
        onSuccess: (result) => {
          resolve({
            user: cognitoUser,
            idToken: result.getIdToken().getJwtToken(),
          });
        },
        onFailure: (error) => {
          reject(error);
        },
        newPasswordRequired: () => {
          resolve({ user: cognitoUser, requiresNewPassword: true });
        },
      }
    );
  });
}

export function completeNewPassword(user: CognitoUser, newPassword: string) {
  return new Promise<{ user: CognitoUser; idToken: string }>((resolve, reject) => {
    user.completeNewPasswordChallenge(newPassword, {}, {
      onSuccess: (result) => {
        resolve({
          user,
          idToken: result.getIdToken().getJwtToken(),
        });
      },
      onFailure: (error) => {
        reject(error);
      },
    });
  });
}
