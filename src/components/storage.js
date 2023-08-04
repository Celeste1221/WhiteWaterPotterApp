import AsyncStorage from '@react-native-async-storage/async-storage'

const KEY = 'faves'

const loadStorage = async() => {
    try {
        const storage = await AsyncStorage.getItem(KEY)

        if (storage === null || storage.length < 0) return [];

        return JSON.parse(storage)
    } catch (e) {
        console.error(e)
    }
}

const saveStorage = async(data) => {
    try{
        await AsyncStorage.setItem(KEY, JSON.stringify(data))
    } catch(e) {
        console.error(e)
    }
}

export {loadStorage, saveStorage}