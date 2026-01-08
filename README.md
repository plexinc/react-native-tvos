# Example Expo project with TV support

## 🚀 How to use

#### Creating a new project

- Create a project: `npx create-expo-app -e with-tv`
- `cd` into the project

- For TV development:

```sh
yarn
yarn prebuild:tv # Executes clean Expo prebuild with TV modifications
yarn ios # Build and run for Apple TV
yarn android # Build for Android TV
yarn web # Run the project on web from localhost
```

> **_NOTE:_**
> Setting the environment variable `EXPO_TV=1` enables the `@react-native-tvos/config-tv` plugin to modify the project for TV.
> This can also be done by setting the parameter `isTV` to true in the `app.json`.
