
import React, { Component } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import CameraRoll from './src/CameraRoll';
import PermissionIos from './src/PermissionIos';
import { PERMISSION_IOS_STATUS, PERMISSION_IOS_TYPES } from './PermissionIosStatics';


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'blue',
    marginBottom: 10,
  },
  text: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
  },
});

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      image: null,
      images: null,
    };
  }

  //이런 식으로 쪼개서 퍼미션을 체크해도 되고
  //PermissionIos.updatePermission(); 을 그대로 불러서 써도 된다
  //퍼미션 함수 제외 나머지는 퍼미션 예외처리 안 함
  checkPermission(isCustomized = false){
    if(isCustomized) {
      PermissionIos.checkPermission()
      .then(r => {
        console.log('check permission: %s', r);
        if( r == "notDetermined"){
          PermissionIos.openSetting();
        }
        else if (r != "authorized"){
          PermissionIos.requestPermission();
        }
      })
      .catch(err => {
        console.log(err);
      });
    } else {
      PermissionIos.updatePermission();
    }
  };

  save(){
    if(this.state.image == null){
      console.log('image is null');
      return;
    }

    CameraRoll.saveImage(this.state.image.uri)
    .catch(err => {
      console.log(err);
    });
  }

  compress(){
    if(this.state.image == null){
      console.log('image is null');
      return;
    }

    console.log('compress');
    CameraRoll.compressImage(this.state.image.uri, 50, 50, 0.01)
    .then(r => {
      console.log(r);
      this.setState({
        image: {
          uri: r,
          width: 10,
          height: 500,
        },
        images: null,
      });
    })
    .catch(err => {
      console.log(err);
    })
  }

  //cameraroll에서 이미지 불러오는 건 공식페이지 샘플과 동일, 다만 smart album이 추가되어 있음.
  //관련하여 안내 작성 예정
  //현재는 전체앨범에서 0번째 인덱스의 이미지를 가져옴
  getImage(){
    console.log("get image");
    CameraRoll.getPhotos({
      first: 3,
      toTime: 0,
      assetType: 'Photos',
      include: ['imageSize', 'filename', 'filesize'],
      groupTypes: 'All',
    })
      .then(r => {
        this.setState({
              image: {
                uri: r.edges[0].node.image.uri,
                width: r.edges[0].node.image.width,
                height: r.edges[0].node.image.height,
              },
              images: null,
            });
      })
      .catch(err => {
        console.log(err);
      });
  }

  cleanupImages() {
    CameraRoll.clean()
      .then(() => {
        console.log('removed tmp images from tmp directory');
      })
      .catch((e) => {
        alert(e);
      });
  }

  scaledHeight(oldW, oldH, newW) {
    return (oldH / oldW) * newW;
  }

  renderImage(image) {
    return (
      <Image
        style={{ width: 300, height: 300, resizeMode: 'contain' }}
        source={image}
      />
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          {this.state.image ? this.renderImage(this.state.image) : null}
          {this.state.images
            ? this.state.images.map((i) => (
                <View key={i.uri}>{this.renderImage(i)}</View>
              ))
            : null}
        </ScrollView>

        <TouchableOpacity
          onPress={() => this.checkPermission(false)}
          style={styles.button}>
          <Text style={styles.text}>Ask permission / Check Permission</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => this.getImage()}
          style={styles.button}>
          <Text style={styles.text}>getImage</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            console.log("image uri::::");
            console.log(this.state.image.uri);
          }}
          style={styles.button}>
          <Text style={styles.text}>console log uri</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            console.log("saveImage 부름");
            CameraRoll.saveImage(this.state.image.uri)
            .catch(err => {
              console.log(err);
            });
            
            console.log("get image");
            CameraRoll.getPhotos({
              first: 10,
              toTime: 0,
              assetType: 'Photos',
              include: ['imageSize', 'filename', 'filesize'],
              groupTypes: 'All',
            })
              .then(r => {
                this.setState({
                      image: {
                        uri: r.edges[9].node.image.uri,
                        width: r.edges[9].node.image.width,
                        height: r.edges[9].node.image.height,
                      },
                      images: null,
                    });
              })
              .catch(err => {
                console.log(err);
              });
            // CameraRoll.save('ph://AAA814CD-27E9-4D8D-A57E-22DE2567723C/L0/001');
          }}
          style={styles.button}>
          <Text style={styles.text}>save selected Image</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => this.compress()}
          style={styles.button}>
          <Text style={styles.text}>compress selected Image</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => this.cleanupImages()}
          style={styles.button}>
          <Text style={styles.text}>clean temp images</Text>
        </TouchableOpacity>
      </View>
    );
  }
}