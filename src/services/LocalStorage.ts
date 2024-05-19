function verifyIfIndexedDB(): boolean {
	return window.indexedDB !== undefined;
}

export async function localStorageFetchService(): Promise<string | null> {
	try {
		return verifyIfIndexedDB()
			? await getApiKeyFromStorage()
			: localStorage.getItem("apiKey");
	} catch (error) {
		throw new Error(error as string);
	}
}

export async function localStorageStoreService(
	apiKey: string,
): Promise<string | null> {
	try {
		verifyIfIndexedDB() && true
			? await saveToIndexedDB(apiKey)
			: localStorage.setItem("apiKey", apiKey as string);
		return null;
	} catch (error) {
		throw new Error(error as string);
	}
}

async function saveToIndexedDB(apiKey: string): Promise<void> {
	const db = await openDB("currencyExchange");
	if (!db.objectStoreNames.contains("apiKey")) {
		await createObjectStore(db, "apiKey");
	}
	await putApiKey(db, apiKey);
	db.close();
}

function openDB(name: string): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(name, 1);
		request.onerror = (event) => reject(`An error occurred: ${event}`);
		request.onsuccess = (event: Event) => {
			resolve((event.target as IDBOpenDBRequest).result);
		};
	});
}

function createObjectStore(db: IDBDatabase, name: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(name, "readwrite");
		if (!db.objectStoreNames.contains("apiKey")) {
			db.createObjectStore("apiKey", { keyPath: "id" });
			transaction.oncomplete = () => resolve();
			transaction.onerror = (event) => reject(`An error occurred: ${event}`);
		}
	});
}

function putApiKey(db: IDBDatabase, apiKey: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction("apiKey", "readwrite");
		const objectStore = transaction.objectStore("apiKey");
		objectStore.put({ id: "apiKey", value: apiKey });
		transaction.oncomplete = () => resolve();
		transaction.onerror = (event) => reject(`An error occurred: ${event}`);
	});
}

async function getApiKeyFromStorage(): Promise<string | null> {
	try {
		if (verifyIfIndexedDB()) {
			const apiKey = await fetchFromIndexedDB("currencyExchange", "apiKey");
			return apiKey?.value || null;
		}
		return localStorage.getItem("apiKey");
	} catch (error) {
		console.error(error);
		return null;
	}
}

async function fetchFromIndexedDB(
	dbName: string,
	storeName: string,
): Promise<{ id: string; value: string } | undefined> {
	const db = await openDB(dbName);
	const transaction = db.transaction(storeName, "readonly");
	const objectStore = transaction.objectStore(storeName);
	const apiKey = await get(objectStore, "apiKey");
	db.close();
	return apiKey;
}

function get(
	store: IDBObjectStore,
	key: string,
): Promise<{ id: string; value: string } | undefined> {
	return new Promise((resolve, reject) => {
		const request = store.get(key);
		request.onsuccess = () => {
			resolve(request.result as { id: string; value: string } | undefined);
		};
		request.onerror = (event) => {
			reject(`An error occurred: ${event}`);
		};
	});
}

async function clearDB(): Promise<void> {
	const dbName = "currencyExchange";
	const storeName = "apiKey";
	const db = await openDB(dbName);
	const transaction = db.transaction(storeName, "readwrite");
	const objectStore = transaction.objectStore(storeName);
	objectStore.clear();
}

export async function clearLocalStorageAndDB(): Promise<void> {
	try {
		if (verifyIfIndexedDB()) {
			clearDB().then(() => window.location.reload());
			return;
		}
		localStorage.clear();
		window.location.reload();
	} catch (error) {
		throw new Error(error as string);
	}
}
