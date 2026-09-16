# CookieTrail

CookieTrail is an Expo/React Native app for quickly logging a pet's routine events.

## Creating an Android Release

1. Create an Expo access token for the Expo account that owns the project.
2. In the GitHub repository, go to **Settings → Secrets and variables → Actions**.
3. Create a repository secret named `EXPO_TOKEN` and store the Expo access token in it.
4. If the project has not yet been configured for EAS, run one successful EAS Android build locally before relying on CI.
5. Tag the commit and push the tag:

   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

GitHub Actions will build `cookietrail-v1.0.0.apk`, create a GitHub Release with automatically generated notes, and attach the APK to it.
