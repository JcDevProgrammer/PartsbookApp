import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Platform,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

const qrLink =
  Constants.expoConfig?.extra?.qrLink || "https://your-app-download-link.com";

export default function SelectModelScreen() {
  const router = useRouter();

  const [showInfoMenu, setShowInfoMenu] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  const toggleInfoMenu = () => setShowInfoMenu((prev) => !prev);

  const goToHome = () => {
    setShowInfoMenu(false);
    router.push("/home-screen");
  };

  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../../assets/icons/printer.png")}
            style={styles.headerIcon}
          />
        </View>

        <TouchableOpacity
          onPress={() => router.push("/model-list")}
          style={styles.searchButton}
        >
          <View style={styles.searchInner}>
            <Image
              source={require("../../assets/icons/search.png")}
              style={styles.searchIcon}
            />
            <Text style={styles.searchButtonText}>Select Machine Model</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleInfoMenu} style={styles.infoButton}>
          <Image
            source={require("../../assets/icons/info.png")}
            style={styles.headerIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Hero Body */}
      <LinearGradient colors={["#f0f2f5", "#ffffff"]} style={styles.body}>
        <View style={styles.heroCard}>
          <View style={styles.logoCircle}>
            <Image
              source={require("../../assets/images/kimura-chaves-logo.png")}
              style={styles.heroLogo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.heroTitle}>KCEI Parts Catalog</Text>
          <Text style={styles.heroSubtitle}>
            Welcome! Access our comprehensive library of machine parts books.
            Use the search bar above to get started.
          </Text>

          <TouchableOpacity
            style={styles.accentButton}
            onPress={() => router.push("/home-screen")}
          >
            <Text style={styles.accentButtonText}>About Our Company</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Modern Popover Menu */}
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
                setShowQRCode(true);
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

      {/* QR Code Modal */}
      <Modal
        visible={showQRCode}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowQRCode(false)}
      >
        <View style={styles.modalOverlay}>
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
              onPress={() => setShowQRCode(false)}
              style={styles.dismissButton}
            >
              <Text style={styles.dismissButtonText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#283593",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingHorizontal: 15,
    paddingBottom: 20,
    justifyContent: "space-between",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    zIndex: 10,
    marginTop: Platform.OS === "web" ? 0 : 30,
  },
  headerLeft: { width: 30 },
  headerIcon: { width: 24, height: 24, tintColor: "#fff" },
  searchButton: {
    flex: 1,
    backgroundColor: "#fff",
    height: 46,
    borderRadius: 23,
    marginHorizontal: 10,
    justifyContent: "center",
    paddingHorizontal: 18,
    elevation: 3,
  },
  searchInner: { flexDirection: "row", alignItems: "center" },
  searchIcon: { width: 18, height: 18, tintColor: "#777", marginRight: 10 },
  searchButtonText: { color: "#555", fontSize: 15, fontWeight: "600" },
  infoButton: { width: 30, alignItems: "flex-end" },
  body: { flex: 1, justifyContent: "center", alignItems: "center" },
  heroCard: {
    width: "90%",
    maxWidth: 420,
    alignItems: "center",
    padding: 35,
    backgroundColor: "#fff",
    borderRadius: 35,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  logoCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    padding: 20,
  },
  heroLogo: { width: "100%", height: "100%" },
  heroTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#1a237e",
    marginBottom: 15,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 35,
    paddingHorizontal: 10,
  },
  accentButton: {
    backgroundColor: "#283593",
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 30,
    elevation: 4,
  },
  accentButtonText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
    zIndex: 100,
  },
  popoverMenu: {
    position: "absolute",
    top: Platform.OS === "ios" ? 105 : 75,
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
