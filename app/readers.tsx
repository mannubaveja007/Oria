import React from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { readers, Reader } from '../constants/readers';

const avatarImages: Record<number, any> = {
  1: require('../assets/images/mira.png'),
  2: require('../assets/images/kabir.png'),
  3: require('../assets/images/anaya.png'),
  4: require('../assets/images/rhea.png'),
};

export default function ReadersScreen() {
  const router = useRouter();

  const handleRequestCall = (readerId: number) => {
    router.push({
      pathname: '/call',
      params: { id: readerId.toString() }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Back Button */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back to horoscope</Text>
        </Pressable>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Block */}
        <View style={styles.headerContainer}>
          <Text style={styles.eyebrowText}>CELESTIAL GUIDES</Text>
          <Text style={styles.titleText}>Connect with a Reader</Text>
          <Text style={styles.subtitleText} selectable>
            Seek direct alignment. Select a specialized guide to begin a session.
          </Text>
        </View>

        {/* Readers List */}
        <View style={styles.listContainer}>
          {readers.map((reader: Reader) => {
            const isNow = reader.available === 'now';
            return (
              <View key={reader.id} style={styles.readerCard}>
                {/* Profile Header Row */}
                <View style={styles.cardHeader}>
                  <View style={styles.avatar}>
                    <Image 
                      source={avatarImages[reader.id]} 
                      style={styles.avatarImage} 
                      contentFit="cover"
                    />
                  </View>
                  <View style={styles.infoCol}>
                    <Text style={styles.nameText} selectable>{reader.name}</Text>
                    <Text style={styles.signText} selectable>{reader.sign.toUpperCase()}</Text>
                  </View>
                  
                  {/* Status indicator */}
                  <View style={styles.statusRow}>
                    <View style={[styles.statusDot, isNow ? styles.statusDotActive : styles.statusDotInactive]} />
                    <Text style={styles.statusText} selectable>
                      {isNow ? "Available now" : "Available today"}
                    </Text>
                  </View>
                </View>

                {/* Specialty description */}
                <Text style={styles.specialtyText} selectable>
                  {reader.specialty}
                </Text>

                {/* Request Button */}
                <Pressable
                  onPress={() => handleRequestCall(reader.id)}
                  style={({ pressed }) => [
                    styles.requestButton,
                    pressed && styles.requestButtonPressed
                  ]}
                >
                  <Text style={styles.requestButtonText}>Request Call</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
    gap: 32,
  },
  headerContainer: {
    gap: 6,
    paddingHorizontal: 4,
  },
  eyebrowText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 10,
    color: '#555555',
    letterSpacing: 2.5,
  },
  titleText: {
    fontFamily: 'CormorantGaramond-Regular',
    fontSize: 32,
    color: '#FFFFFF',
    lineHeight: 38,
  },
  subtitleText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#8A8A8A',
    lineHeight: 20,
    marginTop: 4,
  },
  listContainer: {
    gap: 16,
  },
  readerCard: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderCurve: 'continuous',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#060606',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  avatarText: {
    fontFamily: 'CormorantGaramond-Regular',
    fontSize: 20,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  infoCol: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  nameText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  signText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 9,
    color: '#555555',
    letterSpacing: 1,
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotActive: {
    backgroundColor: '#2EA84F',
    boxShadow: '0 0 6px #2EA84F',
  },
  statusDotInactive: {
    backgroundColor: '#555555',
  },
  statusText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: '#8A8A8A',
  },
  specialtyText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#8A8A8A',
    lineHeight: 20,
  },
  requestButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderCurve: 'continuous',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestButtonPressed: {
    opacity: 0.95,
  },
  requestButtonText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: '#000000',
  },
  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#111111',
  },
  backButton: {
    paddingVertical: 6,
  },
  backButtonText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#8A8A8A',
  },
});
