import {NavigationContainer, useIsFocused, useNavigation,} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useEffect, useRef, useState} from 'react';
import {Pressable, Text, View} from 'react-native';

const RootStack = createNativeStackNavigator();

const NavigationFocusTest = () => {
  return (
    <NavigationContainer>
      <View
        style={{
          position: 'absolute',
          height: '100%',
          width: '100%',
        }}
      >
        <RootStack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <RootStack.Screen component={MainScreen} name="MainStack" />
          <RootStack.Screen
            component={OtherScreenScreen}
            name="OtherScreen"
          />
        </RootStack.Navigator>
      </View>
    </NavigationContainer>
  );
};

export default NavigationFocusTest;

const MainScreen = () => {
  const navigation = useNavigation();

  const isFocused = useIsFocused();

  return (
    <View
      accessible={isFocused}
      importantForAccessibility={isFocused ? 'yes' : 'no-hide-descendants'}
      style={{
        flex: 1,
        opacity: isFocused ? 1 : 0.5,
        padding: 20,
        backgroundColor: 'black',
      }}
    >
      <CustomButton
        onFocus={() => console.log('main button focused')}
        onPress={() => {
          navigation.navigate('OtherScreen');
        }}
      >
        Open a modal
      </CustomButton>
    </View>
  );
};

const OtherScreenScreen = () => {
  const firstButtonRef = useRef(null);
  const secondButtonRef = useRef(null);

  useEffect(() => {
    // Without the patch, the focus would be on the firstButton
    secondButtonRef.current?.requestTVFocus();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        gap: 20,
        backgroundColor: 'black',
      }}
    >
      <CustomButton
        ref={firstButtonRef}
        onPress={() => {
          alert('you pressed button 1')
        }}
      >
        Button 1
      </CustomButton>
      <CustomButton
        ref={secondButtonRef}
        onPress={() => {
          alert('you pressed button 2')
        }}
      >
        Button 2
      </CustomButton>
    </View>
  );
};

const CustomButton = ({children, onFocus, ...props}) => {
  const [focused, setFocused] = useState(false);

  return (
    <Pressable
      {...props}
      style={{
        backgroundColor: 'darkblue',
        borderWidth: 5,
        borderColor: focused ? 'white' : 'transparent',
        padding: 20,
      }}
      onBlur={() => setFocused(false)}
      onFocus={(e) => {
        setFocused(true);

        onFocus?.(e);
      }}
    >
      <Text
        style={{
          color: 'white',
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
};
