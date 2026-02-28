import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  TextInput,
  Alert,
  Platform,
  Modal,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system/legacy";
import axios from "axios";
import { encode } from "base-64";
import Constants from "expo-constants";
import PdfViewer from "../../components/PdfViewer";

const API_KEY = "AIzaSyBQyrQ7B9pgfT_G6FWXmGGF3WJflROQwCU";
const BASE_FOLDER_ID = "199DuYp35mYFnhUH4lpnIgBxZ-65Tclv_";
const BASE_URL = "https://www.googleapis.com/drive/v3";

async function getDriveItems(folderId, pageToken = null) {
  try {
    const params = {
      q: `'${folderId}' in parents`,
      key: API_KEY,
      fields:
        "nextPageToken, files(id, name, mimeType, webContentLink, webViewLink)",
      pageSize: 1000,
    };
    if (pageToken) params.pageToken = pageToken;
    const response = await axios.get(`${BASE_URL}/files`, { params });
    return {
      files: response.data.files || [],
      nextPageToken: response.data.nextPageToken || null,
    };
  } catch (error) {
    console.error("Error fetching Google Drive items:", error);
    return { files: [], nextPageToken: null };
  }
}

async function getTopLevelItems() {
  const { files } = await getDriveItems(BASE_FOLDER_ID, null);
  const folders = files.filter(
    (item) => item.mimeType === "application/vnd.google-apps.folder",
  );
  return folders.sort((a, b) => a.name.localeCompare(b.name));
}

function getFolderLogo(folderName) {
  return require("../../assets/icons/folder.png");
}

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 5000;
  for (let i = 0; i < bytes.byteLength; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return encode(binary);
}

const FolderItem = React.memo(
  ({ item, isExpanded, onToggleFolder, onOpenFile }) => (
    <View style={styles.folderContainer}>
      <TouchableOpacity
        style={styles.folderRow}
        onPress={() => onToggleFolder(item)}
      >
        <View style={styles.folderHeader}>
          <Image source={getFolderLogo(item.name)} style={styles.brandLogo} />
          <Text style={styles.folderTitle}>{item.name}</Text>
          {item.children && item.children.length > 0 && (
            <Text style={styles.folderCount}>
              ({item.children.length} items)
            </Text>
          )}
        </View>
        <Image
          source={require("../../assets/icons/arrow.png")}
          style={[
            styles.arrowIcon,
            isExpanded && { transform: [{ rotate: "180deg" }] },
          ]}
        />
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.fileList}>
          {item.loading ? (
            <ActivityIndicator size="small" color="#283593" />
          ) : item.children && item.children.length > 0 ? (
            item.children
              .sort((a, b) => {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                const aLast =
                  nameA.includes("service manual") ||
                  nameA.includes("troubleshooting");
                const bLast =
                  nameB.includes("service manual") ||
                  nameB.includes("troubleshooting");

                if (aLast && !bLast) return 1;
                if (!aLast && bLast) return -1;
                return nameA.localeCompare(nameB);
              })
              .map((child) => (
                <TouchableOpacity
                  key={child.id}
                  style={styles.fileItem}
                  onPress={() => onOpenFile(child)}
                >
                  <View style={styles.fileRow}>
                    <Image
                      source={require("../../assets/icons/pdf.png")}
                      style={styles.pdfLogo}
                    />
                    <Text style={styles.fileName}>{child.name}</Text>
                  </View>
                </TouchableOpacity>
              ))
          ) : (
            <Text style={styles.noFilesText}>No files found.</Text>
          )}
        </View>
      )}
    </View>
  ),
);

export default function ModelListScreen() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedFolder, setExpandedFolder] = useState(null);
  const [selectedPdfBase64, setSelectedPdfBase64] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showInfoMenu, setShowInfoMenu] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const pdfViewerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpacity] = useState(new Animated.Value(0));

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(!!online);
    });
    if (isOnline) {
      loadTopLevelItems();
    } else {
      loadCachedItems();
    }
    return () => unsubscribe();
  }, [isOnline]);

  useEffect(() => {
    if (showAccessModal) {
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showAccessModal]);

  const loadTopLevelItems = async () => {
    setLoading(true);
    try {
      const driveItems = await getTopLevelItems();
      setItems(driveItems);
      await AsyncStorage.setItem(
        "@cachedDriveItems",
        JSON.stringify(driveItems),
      );
    } catch (error) {
      console.error("Error loading top-level items:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCachedItems = async () => {
    try {
      const cached = await AsyncStorage.getItem("@cachedDriveItems");
      if (cached) {
        setItems(JSON.parse(cached));
      }
    } catch (error) {
      console.error("Error loading cached drive items:", error);
    }
  };

  const fetchFolderChildren = async (folder) => {
    if (!isOnline) {
      Alert.alert("Offline", "Cannot fetch folder contents offline.");
      return;
    }
    try {
      folder.loading = true;
      setItems([...items]);
      const { files } = await getDriveItems(folder.id);
      folder.children = files.sort((a, b) => a.name.localeCompare(b.name));
      folder.loading = false;
      setItems([...items]);
    } catch (error) {
      console.error("Error fetching folder children:", error);
      folder.loading = false;
      setItems([...items]);
    }
  };

  const handleToggleFolder = async (folder) => {
    if (expandedFolder && expandedFolder.id === folder.id) {
      setExpandedFolder(null);
      return;
    }
    setExpandedFolder(folder);
    if (folder.mimeType === "application/vnd.google-apps.folder") {
      if (!folder.children) {
        await fetchFolderChildren(folder);
      }
    }
  };

  const handleOpenFile = async (file) => {
    if (!isOnline) {
      Alert.alert("Offline", "Cannot view PDF offline.");
      return;
    }
    if (Platform.OS === "web") {
      const viewerUrl = `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(
        file.webContentLink,
      )}`;
      setSelectedPdfBase64(viewerUrl);
      return;
    }
    try {
      setIsDownloading(true);
      const fileUri = FileSystem.cacheDirectory + file.id + ".pdf";
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        const cachedData = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setSelectedPdfBase64(cachedData);
      } else {
        const downloadRes = await FileSystem.downloadAsync(
          file.webContentLink,
          fileUri,
        );
        const base64 = await FileSystem.readAsStringAsync(downloadRes.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setSelectedPdfBase64(base64);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to download PDF: " + error.message);
      console.error("Error downloading PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Info", "Printing not supported on web in this snippet.");
    } else if (selectedPdfBase64) {
      try {
        const fileUri = FileSystem.cacheDirectory + "temp.pdf";
        await FileSystem.writeAsStringAsync(fileUri, selectedPdfBase64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await Print.printAsync({ uri: fileUri });
      } catch (error) {
        Alert.alert("Error", "Failed to print PDF: " + error.message);
      }
    }
  };

  const handleSearch = () => {
    if (Platform.OS !== "web" && pdfViewerRef.current) {
      pdfViewerRef.current.postMessage("focusSearch");
    } else {
      Alert.alert("Search", "Please use the browser's find (Ctrl+F) feature.");
    }
  };

  const toggleInfoMenu = () => setShowInfoMenu((prev) => !prev);
  const goToHome = () => {
    setShowInfoMenu(false);
    router.push("/home-screen");
  };

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return items;
    return items.reduce((acc, folder) => {
      const folderNameMatches = folder.name.toLowerCase().includes(query);
      if (folderNameMatches) {
        acc.push(folder);
      } else if (
        folder.children &&
        folder.children.some((child) =>
          child.name.toLowerCase().includes(query),
        )
      ) {
        const newFolder = { ...folder };
        newFolder.children = folder.children.filter((child) =>
          child.name.toLowerCase().includes(query),
        );
        acc.push(newFolder);
      }
      return acc;
    }, []);
  }, [items, searchQuery]);

  if (Platform.OS === "web" && selectedPdfBase64) {
    return (
      <View style={styles.viewerContainer}>
        <View style={styles.viewerHeader}>
          <TouchableOpacity onPress={() => setSelectedPdfBase64(null)}>
            <Image
              source={require("../../assets/icons/back.png")}
              style={styles.viewerIcon}
            />
          </TouchableOpacity>
          <Text style={styles.viewerTitle}>PDF Viewer</Text>
          <View style={styles.viewerActions}>
            <TouchableOpacity onPress={handlePrint}>
              <Image
                source={require("../../assets/icons/printer.png")}
                style={styles.viewerIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Search",
                  "Please use the browser's find (Ctrl+F) feature.",
                )
              }
            >
              <Image
                source={require("../../assets/icons/search.png")}
                style={styles.viewerIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <PdfViewer ref={pdfViewerRef} uri={selectedPdfBase64} />
        </View>
      </View>
    );
  }

  if (selectedPdfBase64 && Platform.OS !== "web") {
    return (
      <View style={styles.viewerContainer}>
        <View style={styles.viewerHeader}>
          <TouchableOpacity onPress={() => setSelectedPdfBase64(null)}>
            <Image
              source={require("../../assets/icons/back.png")}
              style={styles.viewerIcon}
            />
          </TouchableOpacity>
          <Text style={styles.viewerTitle}>PDF Viewer</Text>
          <View style={styles.viewerActions}>
            <TouchableOpacity onPress={handlePrint}>
              <Image
                source={require("../../assets/icons/printer.png")}
                style={styles.viewerIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSearch}>
              <Image
                source={require("../../assets/icons/search.png")}
                style={styles.viewerIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <PdfViewer ref={pdfViewerRef} base64Data={selectedPdfBase64} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isDownloading && Platform.OS !== "web" && (
        <View style={styles.downloadOverlay}>
          <View style={styles.downloadBox}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.downloadText}>Downloading PDF...</Text>
          </View>
        </View>
      )}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require("../../assets/icons/back.png")}
            style={styles.headerIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select a Model</Text>
        <TouchableOpacity onPress={toggleInfoMenu}>
          <Image
            source={require("../../assets/icons/info.png")}
            style={styles.headerIcon}
          />
        </TouchableOpacity>
      </View>

      {showInfoMenu && (
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowInfoMenu(false)}
        >
          <View style={styles.popoverMenu}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setShowInfoMenu(false)}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => {
                setShowInfoMenu(false);
                setShowAccessModal(true);
              }}
            >
              <Image
                source={require("../../assets/icons/download.png")}
                style={styles.menuRowIcon}
              />
              <Text style={styles.menuRowText}>Get Mobile App</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuRow} onPress={goToHome}>
              <Image
                source={require("../../assets/icons/info.png")}
                style={styles.menuRowIcon}
              />
              <Text style={styles.menuRowText}>Company Info</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      <Modal
        visible={showAccessModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowAccessModal(false)}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: modalOpacity }]}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Scan to Install</Text>
            <View style={styles.qrContainer}>
              <Image
                source={require("../../assets/images/qr-code.png")}
                style={styles.qrCode}
              />
            </View>
            <Text style={styles.modalHint}>
              Download our official app to browse faster online. Internet
              connection required.
            </Text>
            <TouchableOpacity
              onPress={() => setShowAccessModal(false)}
              style={styles.dismissButton}
            >
              <Text style={styles.dismissButtonText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>

      <View style={styles.searchContainer}>
        {!isOnline && (
          <Text style={{ color: "red", marginBottom: 5 }}>
            Offline mode. Showing cached data (if available).
          </Text>
        )}
        <TextInput
          style={styles.searchBar}
          placeholder="Search machine or part..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#283593"
          style={{ marginTop: 40 }}
        />
      ) : filteredData.length > 0 ? (
        <FlatList
          data={filteredData.sort((a, b) => a.name.localeCompare(b.name))}
          keyExtractor={(item) => item.id}
          initialNumToRender={15}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <FolderItem
              item={item}
              isExpanded={expandedFolder && expandedFolder.id === item.id}
              onToggleFolder={handleToggleFolder}
              onOpenFile={handleOpenFile}
            />
          )}
        />
      ) : (
        <View style={styles.noMatchContainer}>
          <Text style={styles.noMatchText}>
            {isOnline
              ? "No machine models match your search."
              : "No offline data available."}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#283593",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 15,
    paddingHorizontal: 15,
    justifyContent: "space-between",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    marginTop: Platform.OS === "web" ? 0 : 30,
  },
  headerIcon: { width: 24, height: 24, tintColor: "#fff" },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "800" },
  searchContainer: { padding: 15, backgroundColor: "#fff", elevation: 2 },
  searchBar: {
    backgroundColor: "#f1f3f5",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  folderContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  folderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  folderHeader: { flexDirection: "row", alignItems: "center", flexShrink: 1 },
  brandLogo: { width: 32, height: 32, marginRight: 15, resizeMode: "contain" },
  folderTitle: {
    fontSize: 17,
    color: "#1a237e",
    fontWeight: "800",
    flexShrink: 1,
  },
  folderCount: {
    fontSize: 13,
    color: "#888",
    marginLeft: 8,
    fontWeight: "600",
  },
  arrowIcon: { width: 18, height: 18, tintColor: "#999" },
  fileList: {
    backgroundColor: "#fbfcfd",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  fileItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  fileRow: { flexDirection: "row", alignItems: "center" },
  pdfLogo: { width: 22, height: 22, marginRight: 15, resizeMode: "contain" },
  fileName: { fontSize: 15, color: "#333", fontWeight: "600" },
  noFilesText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    paddingVertical: 10,
  },
  noMatchContainer: { marginTop: 60, alignItems: "center" },
  noMatchText: { fontSize: 17, color: "#888", fontWeight: "600" },
  viewerContainer: { flex: 1, backgroundColor: "#000" },
  viewerHeader: {
    flexDirection: "row",
    backgroundColor: "#283593",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 15,
    paddingHorizontal: 15,
    marginTop: Platform.OS === "web" ? 0 : 30,
  },
  viewerTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  viewerActions: { flexDirection: "row" },
  viewerIcon: { width: 24, height: 24, tintColor: "#fff", marginLeft: 20 },
  downloadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.8)",
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
  },
  downloadBox: {
    backgroundColor: "#1a1a1a",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
  },
  downloadText: {
    color: "#fff",
    marginTop: 15,
    fontSize: 17,
    fontWeight: "700",
  },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
    zIndex: 100,
  },
  popoverMenu: {
    position: "absolute",
    top: Platform.OS === "ios" ? 100 : 70,
    right: 15,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: 250,
    elevation: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  menuTitle: { fontSize: 18, fontWeight: "900", color: "#1a237e" },
  closeIcon: { fontSize: 20, color: "#ccc", fontWeight: "700" },
  divider: { height: 1, backgroundColor: "#f0f0f0", marginBottom: 15 },
  menuRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14 },
  menuRowIcon: { width: 22, height: 22, tintColor: "#283593", marginRight: 15 },
  menuRowText: { fontSize: 16, color: "#333", fontWeight: "700" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },
  modalBox: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 40,
    padding: 40,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1a237e",
    marginBottom: 30,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginBottom: 25,
  },
  qrCode: { width: 180, height: 180, resizeMode: "contain" },
  modalHint: {
    color: "#666",
    textAlign: "center",
    marginBottom: 35,
    lineHeight: 24,
    fontSize: 15,
  },
  dismissButton: {
    backgroundColor: "#283593",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 30,
  },
  dismissButtonText: { color: "#fff", fontSize: 17, fontWeight: "800" },
});
