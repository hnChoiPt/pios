/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */


import React from 'react';
import type {Node} from 'react';
import CameraRoll from './src/CameraRoll';
import PermissionIos from './src/PermissionIos';
import { PERMISSION_IOS_STATUS, PERMISSION_IOS_TYPES } from './src/PermissionIosStatics';
import IosPermissionHandler from './src/IosPermissionHandler';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  FlatList,
  TouchableOpacity,
  PermissionsAndroid,
  Image,
  Button,
  Alert,
  Platform
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';


const Section = ({children, title}): Node => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

function loadPhotosMilsec(request = 20, timeStamp = 0, type = 'All', flags = ['playableDuration']){
  CameraRoll.getPhotos({
    first: request,
    toTime: timeStamp ? (timeStamp - 1) * 1000 : 0,
    assetType: type,
    include: flags,
    groupTypes: 'SmartAlbum',
  })
    .then(r => {
      console.log(r);
    })
    .catch(err => {
      console.log(err);
    });
};

function loadAlbums(type = 'All', aTypes = 'All'){
  CameraRoll.getAlbums({
    assetType: type,
    albumType: aTypes,
  })
  .then(r => {
    console.log(r);
  })
  .catch(err => {
    console.log(err);
  });
};

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  }; 
  
  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>

          <Section>
            <Button title='update permission'
            onPress={()=>{
              PermissionIos.updatePermission();
            }}/>
          </Section>
          <Section>
            <Button title={"photo load"} 
              onPress={()=>
                {loadPhotosMilsec();}
            } />  
          </Section>
          
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
