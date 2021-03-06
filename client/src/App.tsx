import React, {FC} from 'react';
import AuthContextProvider from './contexts/AuthContext';
import QueryProvider from './contexts/QueryContext';
import I18nProvider from './contexts/I18nContext';
import RootProvider from './contexts/RootContext';
import RootContainer from './pages/containers/RootContainer';
import './App.scss';

// language is the first class
// singletons such as tooltip, dialog are in root providers, and all charts settings are loaded here
// auth context is the next level, it will handler the login and store the token
// QueryProvider is the place to decide which Query**Provider would be used by the DBType in RootProvider. All Query**Providers exports has the same key, so QueryProvider would be used in children,
// we need to put token in query header, so the query is the last context
const App: FC = () => {
  return (
    <I18nProvider>
      <RootProvider>
        <AuthContextProvider>
          <QueryProvider>
            <QueryProvider>
              <RootContainer />
            </QueryProvider>
          </QueryProvider>
        </AuthContextProvider>
      </RootProvider>
    </I18nProvider>
  );
};

export default App;
