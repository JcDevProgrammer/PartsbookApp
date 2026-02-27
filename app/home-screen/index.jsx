import React, { useEffect, useRef } from "react";
import {
  Animated,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const openURL = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        alert("Cannot open URL: " + url);
      }
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  };

  return (
    <LinearGradient
      colors={["#f8f9fa", "#e9ecef", "#dee2e6"]}
      style={styles.gradientContainer}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Image
              source={require("../../assets/icons/back.png")}
              style={styles.headerIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Company Info</Text>
          <View style={{ width: 20 }} />
        </View>

        <Animated.View
          style={[
            styles.body,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Main Logo Card */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/kimura-chaves-logo.png")}
              style={styles.bannerImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.welcomeText}>
            Welcome to Kimura Chaves Enterprise Inc.
          </Text>

          {/* Action Buttons */}
          <View style={styles.socialButtonsRow}>
            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: "#3b5998" }]}
              onPress={() =>
                openURL("https://www.facebook.com/kimurachavesenterpriseinc")
              }
            >
              <Text
                style={styles.buttonText}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Facebook Page
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, { backgroundColor: "#283593" }]}
              onPress={() => openURL("https://kceisewing.com/")}
            >
              <Text
                style={styles.buttonText}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                Visit Our Website
              </Text>
            </TouchableOpacity>
          </View>

          {/* About Us Card */}
          <View style={styles.card}>
            <View style={styles.imageWrapper}>
              <Image
                source={require("../../assets/images/about-us.jpg")}
                style={styles.sectionImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.sectionTitle}>ABOUT US</Text>
              <Text style={styles.sectionContent}>
                We firmly believe that any garment or sewing project has the
                potential to achieve world-class quality. Whether you're a
                business or a home user, we're here to help you achieve that.
                {"\n\n"}
                We do this by starting each interaction with an in-depth
                consultation regarding your sewing needs. This guides us in
                creating smart solutions by suggesting only the best tools
                available.
              </Text>
            </View>
          </View>

          {/* Contact Us Card */}
          <View style={styles.card}>
            <View style={styles.imageWrapper}>
              <Image
                source={require("../../assets/images/contact-us.png")}
                style={styles.sectionImage}
                resizeMode="cover"
              />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.sectionTitle}>CONTACT US</Text>
              <View style={styles.contactDetails}>
                <Text style={styles.locationTitle}>
                  Metro Manila Headquarters
                </Text>

                <View style={styles.contactRow}>
                  <Text style={styles.label}>Email:</Text>
                  <Text style={styles.contactValue}>
                    kimurachaves1978@gmail.com
                  </Text>
                </View>

                <View style={styles.contactRow}>
                  <Text style={styles.label}>Phone:</Text>
                  <Text style={styles.contactValue}>+63 723 0241 to 43</Text>
                </View>

                <View style={styles.contactRow}>
                  <Text style={styles.label}>Smart:</Text>
                  <Text style={styles.contactValue}>+63 908 254 2709</Text>
                </View>

                <View style={styles.contactRow}>
                  <Text style={styles.label}>Globe:</Text>
                  <Text style={styles.contactValue}>+63 926 717 7768</Text>
                </View>

                <Text style={styles.addressLabel}>Address:</Text>
                <Text style={styles.addressValue}>
                  284-C Doña Anita Bldg., E. Rodriguez Sr. Ave., Quezon City,
                  Metro Manila
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#283593",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    justifyContent: "space-between",
    width: "100%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginTop: Platform.OS === "web" ? 0 : 30,
  },
  backButton: {
    padding: 5,
  },
  headerIcon: {
    width: 24,
    height: 24,
    tintColor: "#fff",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  body: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 20,
    marginTop: 25,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    maxWidth: 600,
  },
  bannerImage: {
    width: "100%",
    height: 70,
  },
  welcomeText: {
    fontSize: 22,
    color: "#1a237e",
    marginBottom: 30,
    textAlign: "center",
    fontWeight: "900",
    paddingHorizontal: 15,
  },
  socialButtonsRow: {
    flexDirection: Platform.OS === "web" ? "row" : "column",
    justifyContent: "center",
    width: "100%",
    maxWidth: 600,
    gap: 12,
    marginBottom: 25,
  },
  socialButton: {
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 15,
    width: Platform.OS === "web" ? 200 : "100%",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 25,
    marginBottom: 30,
    width: "100%",
    maxWidth: 600,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  imageWrapper: {
    width: "100%",
    height: 220,
    backgroundColor: "#f0f0f0",
  },
  sectionImage: {
    width: "100%",
    height: "100%",
  },
  cardBody: {
    padding: 25,
  },
  sectionTitle: {
    fontSize: 24,
    color: "#283593",
    fontWeight: "900",
    marginBottom: 15,
    letterSpacing: 1.2,
  },
  sectionContent: {
    fontSize: 16,
    color: "#444",
    lineHeight: 26,
    textAlign: "justify",
  },
  contactDetails: {
    marginTop: 5,
  },
  locationTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#1a237e",
    marginBottom: 15,
  },
  contactRow: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-start",
  },
  label: {
    fontWeight: "800",
    color: "#283593",
    width: 60,
    fontSize: 14,
  },
  contactValue: {
    flex: 1,
    fontSize: 15,
    color: "#444",
    fontWeight: "500",
  },
  addressLabel: {
    fontWeight: "800",
    color: "#283593",
    marginTop: 15,
    marginBottom: 5,
    fontSize: 14,
  },
  addressValue: {
    fontSize: 15,
    color: "#444",
    lineHeight: 24,
    fontWeight: "500",
  },
});
