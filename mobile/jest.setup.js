jest.mock("@react-native-async-storage/async-storage", () =>
    require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("expo-secure-store", () => {
    const store = {};

    return {
        getItemAsync: jest.fn((key) => Promise.resolve(Object.hasOwn(store, key) ? store[key] : null)),
        setItemAsync: jest.fn((key, value) => {
            store[key] = value;
            return Promise.resolve();
        }),
        deleteItemAsync: jest.fn((key) => {
            delete store[key];
            return Promise.resolve();
        }),
    };
});
