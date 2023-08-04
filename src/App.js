import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, FlatList, Image} from 'react-native';

//navigation
import { NavigationContainer, useNavigation } from '@react-navigation/native'; //root navigation container
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; //manage screens and history in tab nav
import { createStackNavigator } from '@react-navigation/stack'

import 'react-native-gesture-handler'
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; //icons
import { loadStorage, saveStorage } from './components/storage';

//mail composer
import * as MailComposer from 'expo-mail-composer';

//images from: https://www.whitewaterpottery.com/products with permission from owner
//code modified from: https://snack.expo.dev/@troublediehard/render-images-array
//put in a json file, then import the object from the file
const items = [{id: 'img1', desc: 'Blue Dipped Bowl', price: '$45.00', 
                image: require('./components/assets/blue_dipped_bowl.webp')},
                {id: 'img2',desc: 'Blue Dipped Red Stoneware Mug', price: '$20.00', 
                image: require('./components/assets/blue_dipped_red_stoneware_mug.webp')},
                {id: 'img3',desc: 'Blue Dipped Red Stoneware Vase', price: '$40.00', 
                image: require('./components/assets/blue_dipped_red_stoneware_vase.webp')},
                {id: 'img4',desc: 'White Mug - Faceted', price: '$20.00', 
                image: require('./components/assets/white_mug_faceted.webp')}]

//the initialRouteName prop assigns the default screen to load when the app is launched
const Root = createStackNavigator()
export default function App() {
  return (
    <SafeAreaProvider>
    <NavigationContainer>
      <Root.Navigator initialRouteName='Tabs' screenOptions={{activeTintColor: 'red'}}>
        <Root.Screen name="Tabs" component={Tabs} options={{headerShown: false}} />
      </Root.Navigator>   
    </NavigationContainer>
    </SafeAreaProvider>
  );
}

//for finding icons: https://icons.expo.fyi/  
const Tab = createBottomTabNavigator(); //tab navigator instance
function Tabs() {
  return(
    <Tab.Navigator screenOptions={{activeTintColor: 'blue'}}>
        <Tab.Screen name = "Whitewater Pottery" component={HomeScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color, size })=> {
            let iconName = "home-sharp"
            if (focused) {
              iconName = "home"
            }
            return <Ionicons name={iconName} size={size} color={color} />
          },
        }} />
        <Tab.Screen name="Gallery" component={ListView}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color, size })=>{
            let iconName = "ios-list"
            if (focused) {
              iconName = "ios-list-circle"
            }
            return <Ionicons name={iconName} size={size} color={color} />
          },
        }} />
        <Tab.Screen name="Favorites" component={FavoritesScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ focused, color, size })=>{
            let iconName = "md-heart-outline"
            if (focused) {
              iconName = "md-heart-sharp"
            }
            return <Ionicons name={iconName} size={size} color={color} />
          },
        }} />
    </Tab.Navigator>
    )
  }

//use edges prop on SafeAreaView or the useSafeAreInsets hook to apply padding to content
//this navigator will be listed in the tab navigator list screen
const ListStack= createStackNavigator()
function ListScreen() {
  return (
    <ListStack.Navigator>
      <ListStack.Screen name="Gallery" component={ListView}/>
    </ListStack.Navigator>
  )
}

function HomeScreen(){
  const navigation = useNavigation()

   //code modified from: https://snack.expo.dev/@dmsi/54cc54?platform=web
   //MailComposer docs: https://docs.expo.dev/versions/latest/sdk/mail-composer/#mailcomposeroptions
   const [didItResolve, setDidItResolve] = React.useState(false);
   const openMailComposer = () => {
     setDidItResolve(false);
     MailComposer.isAvailableAsync()
       .then((available) => {
         if (available) {
           MailComposer.composeAsync({recipients: ['celeste1221@gmail.com']})
             .then((result) => {
               setDidItResolve(true);
               console.log(result);
             })
             .catch((err) => {
               setDidItResolve(false);
             });
         } else {
           reject(new Error('Mail is Unavailable'));
         }
       })
       .catch((err) => {
         console.log(err);
         setDidItResolve(false);
       });
   };
  return(
    <View style={styles.container}>
    <TouchableOpacity onPress={()=> navigation.navigate('Gallery')}>
      <Image style={styles.home_image} source={require('./components/assets/logo.webp')}>
      </Image>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={openMailComposer}>Contact Us</TouchableOpacity>
    </View>
  )
}

function ListView() {
  const navigation = useNavigation()
   
  //TODO (later): instead of navigation, call function that adds item to storage, then render items in storage on favorites screen;
  //click on image, call savestorage, conditional rendering: if in storage, turn heart red, else it's default color (check detail item)
  const renderItem = ({item}) => {
    return(
      <View style={styles.container}>
        <Text>{item.desc}</Text>
        
          <TouchableOpacity onPress={()=> navigation.navigate('Detail', {item: item})}>
          <Image style={styles.image} source={item.image}></Image>
          {/*add a view to be parent of img and heart icon on top of img*/}
          </TouchableOpacity>
      </View>
    )
  }

  return(
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <FlatList numColumns={2} data={items} keyExtractor={item=>item.id} renderItem={renderItem} />
    </SafeAreaView>
  )
};

function DetailView({route}) {
  const {item} = route.params
  const [faves, setFaves] = React.useState([])

  React.useEffect(() =>{
    loadStorage().then(data=> { //set initial storage on load
      setFaves(data)
    })
  },[])

  const renderIcon=(item)=> {
    const [iconState, setIconState] = React.useState(false)

    React.useEffect(()=>{
      if (faves.find(obj => obj.id === item.id)) {
        setIconState(true)
      } else {
        setIconState(false)
      }
    })

    return (
      <Ionicons.Button name="star" backgroundColor={iconState?"red": "blue"} onPress={ ()=> {
        if (faves.filter(obj => obj.id == item.id).length > 0) { //already in storage
          setIconState(false) //set icon false
          const newFaves = faves.filter(obj=> obj.id !== item.id) //filter out item in faves
          saveStorage(newFaves) //save to storage
        } else {
          faves.push(item) //add item to faves
          saveStorage(faves) //save in storage
          setIconState(true) //set icon true
        }
        //reload storage
        loadStorage().then(data=>{setFaves(data)}
        )
      }} />
    )
  }

return (
  <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
    <Text>{item.title}</Text>
    {renderIcon(item)}
  </SafeAreaView>
  )
}

//display favorites
//load storage and set data
function FavoritesScreen() {
  const insets = useSafeAreaInsets() //for ios
  const navigation = useNavigation()
  const [faves, setFaves] = React.useState([])

  React.useEffect(()=>{
    loadStorage().then(data=>{  //return an array of id's
      setFaves(data)
    })
  }, [faves]) //update when faves is updated

  const renderItem = ({item}) => {
    return (
      <View style={styles.container}>
        <Text>{item.title}</Text>
        <Button title="go to detail" onPress={ ()=> navigation.navigate('Detail', {item: item})} />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <FlatList data={faves} horizontal={true} keyExtractor={item=>item.id} renderItem={renderItem}/>
    </SafeAreaView>
  )
}

//reference for colors: https://reactnative.dev/docs/colors
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    //add border bottom and define weight of line
    width: 300,
    height: 300,
    backgroundColor: '#dcdcdc',
    borderWidth:2,
    borderColor:'white',
    resizeMode:'cover',
    borderRadius: 15,
    margin:8
  },
  home_image: {
    width:500,
    height:500,
    resizeMode:'contain',
    margin:8,
    
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 40,
    margin: 16,
    padding: 16,
  },
})