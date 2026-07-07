import { Redirect } from 'expo-router';

export default function Index() {
  // The _layout.tsx will handle the actual auth-based redirection.
  // For the default route, we can just redirect to the tabs by default,
  // and let the layout intercept it if the user isn't logged in.
  return <Redirect href="/(tabs)/catalog" />;
}
