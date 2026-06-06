import React, { useState, useMemo, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useOnboarding } from '../context/OnboardingContext';
import { getZodiacSign } from '../utils/zodiac';
import { zodiacData } from '../constants/zodiacData';
import { readers, Reader } from '../constants/readers';
import { triggerLight, triggerMedium, triggerSuccess } from '../utils/haptics';
import CelestialBackground from '../components/CelestialBackground';

const avatarImages: Record<number, any> = {
  1: require('../assets/images/mira.png'),
  2: require('../assets/images/kabir.png'),
  3: require('../assets/images/anaya.png'),
  4: require('../assets/images/rhea.png'),
};

const enrichedDetails: Record<number, { tags: string[]; rating: string; sessions: string; price: string; bio: string }> = {
  1: {
    tags: ["Moon", "Clarity"],
    rating: "4.9",
    sessions: "128 readings",
    price: "$12/min",
    bio: "Gentle guidance for emotional clarity and timing."
  },
  2: {
    tags: ["Love", "Clarity"],
    rating: "4.8",
    sessions: "94 readings",
    price: "$10/min",
    bio: "Empathetic alignment of relationships and personal paths."
  },
  3: {
    tags: ["Moon", "Love"],
    rating: "4.7",
    sessions: "82 readings",
    price: "$8/min",
    bio: "Intuitive lunar guidance to reveal hidden paths and desires."
  },
  4: {
    tags: ["Clarity", "Love"],
    rating: "4.9",
    sessions: "156 readings",
    price: "$15/min",
    bio: "Transformative guidance to unlock your highest potential."
  }
};

const FILTER_OPTIONS = ["All", "Love", "Clarity", "Moon", "Now"];

export default function ReadersScreen() {
  const router = useRouter();
  const { onboardingData } = useOnboarding();

  // State
  const [selectedFilter, setSelectedFilter] = useState("All");

  // Availability Dot Pulse Animation
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Staggered Cards Reveal Anims
  const cardOpacityAnims = useRef(Array.from({ length: 4 }, () => new Animated.Value(0))).current;
  const cardYAnims = useRef(Array.from({ length: 4 }, () => new Animated.Value(12))).current;

  // Card Press Scale Anims
  const cardPressScales = useRef(Array.from({ length: 4 }, () => new Animated.Value(1))).current;
  const buttonPressScales = useRef(Array.from({ length: 4 }, () => new Animated.Value(1))).current;

  // Resolve user zodiac sign context
  const resolvedSign = useMemo(() => {
    if (onboardingData.zodiacSign && zodiacData[onboardingData.zodiacSign]) {
      return zodiacData[onboardingData.zodiacSign];
    }
    if (onboardingData.dob) {
      return getZodiacSign(onboardingData.dob);
    }
    return zodiacData["Aquarius"];
  }, [onboardingData.zodiacSign, onboardingData.dob]);

  // Combine readers with enriched details
  const enrichedReaders = useMemo(() => {
    return readers.map(r => ({
      ...r,
      ...enrichedDetails[r.id]
    }));
  }, []);

  // Filter guides list
  const filteredReaders = useMemo(() => {
    if (selectedFilter === "All") return enrichedReaders;
    if (selectedFilter === "Now") {
      return enrichedReaders.filter(r => r.available === "now");
    }
    return enrichedReaders.filter(r => r.tags.includes(selectedFilter));
  }, [selectedFilter, enrichedReaders]);

  // Handle availability pulsing loop
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.5, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Trigger stagger animation whenever filter list changes
  useEffect(() => {
    // Reset animations
    cardOpacityAnims.forEach(anim => anim.setValue(0));
    cardYAnims.forEach(anim => anim.setValue(12));

    const anims = filteredReaders.map((_, index) => {
      if (index >= 4) return null;
      return Animated.parallel([
        Animated.timing(cardOpacityAnims[index], {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        }),
        Animated.timing(cardYAnims[index], {
          toValue: 0,
          duration: 400,
          useNativeDriver: true
        })
      ]);
    }).filter((a): a is Animated.CompositeAnimation => a !== null);

    Animated.stagger(80, anims).start();
  }, [filteredReaders]);

  const handleRequestCall = (readerId: number) => {
    triggerSuccess();
    router.push({
      pathname: '/call',
      params: { id: readerId.toString() }
    });
  };

  // Card scale press responses
  const handleCardPressIn = (index: number) => {
    triggerLight();
    Animated.spring(cardPressScales[index], {
      toValue: 0.98,
      useNativeDriver: true
    }).start();
  };

  const handleCardPressOut = (index: number) => {
    Animated.spring(cardPressScales[index], {
      toValue: 1.0,
      useNativeDriver: true
    }).start();
  };

  // Button scale press responses
  const handleBtnPressIn = (index: number) => {
    triggerLight();
    Animated.spring(buttonPressScales[index], {
      toValue: 0.96,
      useNativeDriver: true
    }).start();
  };

  const handleBtnPressOut = (index: number) => {
    Animated.spring(buttonPressScales[index], {
      toValue: 1.0,
      useNativeDriver: true
    }).start();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CelestialBackground density="low" showConstellation={false} intensity={0.3} />
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => { triggerLight(); router.back(); }} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back to horoscope</Text>
        </Pressable>
        {/* Subtle Decorative Moon Glyph */}
        <Text style={styles.headerMoonGlyph}>☾</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Header with user context */}
        <View style={styles.headerContainer}>
          <Text style={styles.eyebrowText}>
            {resolvedSign.sign.toUpperCase()} · {resolvedSign.element.toUpperCase()} SIGN
          </Text>
          <Text style={styles.titleText}>Guides</Text>
          <Text style={styles.subtitleText} selectable>
            Choose who feels aligned for today.
          </Text>
        </View>

        {/* Horizontal Filter Chips Bar */}
        <View style={styles.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBarContent}>
            {FILTER_OPTIONS.map((filter) => {
              const isActive = selectedFilter === filter;
              return (
                <Pressable
                  key={filter}
                  onPress={() => {
                    triggerLight();
                    setSelectedFilter(filter);
                  }}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                    {filter}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Main Guides List */}
        <View style={styles.listContainer}>
          {filteredReaders.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No guides are aligned with this filter. Select 'All' to view all available guides.
              </Text>
            </View>
          ) : (
            filteredReaders.map((reader, index) => {
              const isFeatured = index === 0; // The first in the list is featured
              const isNow = reader.available === 'now';
              
              // We map animations to indices dynamically (0 to 3) safely
              const opacityVal = cardOpacityAnims[index] || 1;
              const translateYVal = cardYAnims[index] || 0;
              const cardScaleVal = cardPressScales[index] || 1;
              const btnScaleVal = buttonPressScales[index] || 1;

              if (isFeatured) {
                // FEATURED GUIDE card layout
                return (
                  <Animated.View
                    key={reader.id}
                    style={[
                      styles.featuredCardWrapper,
                      {
                        opacity: opacityVal,
                        transform: [
                          { translateY: translateYVal },
                          { scale: cardScaleVal }
                        ]
                      }
                    ]}
                  >
                    <Pressable
                      onPressIn={() => handleCardPressIn(index)}
                      onPressOut={() => handleCardPressOut(index)}
                      style={styles.featuredCard}
                    >
                      {/* Guide header */}
                      <View style={styles.featuredHeader}>
                        <View style={styles.avatarContainer}>
                          <Image 
                            source={avatarImages[reader.id]} 
                            style={styles.featuredAvatar} 
                            contentFit="cover"
                          />
                        </View>
                        
                        <View style={styles.featuredHeaderMeta}>
                          <View style={styles.featuredNameRow}>
                            <Text style={styles.featuredName} selectable>{reader.name}</Text>
                            <View style={styles.badgeFeatured}>
                              <Text style={styles.badgeFeaturedText}>FEATURED</Text>
                            </View>
                          </View>
                          <Text style={styles.featuredSign} selectable>{reader.sign.toUpperCase()} SIGN</Text>
                          
                          {/* Live Status indicator */}
                          <View style={styles.statusRow}>
                            <Animated.View 
                              style={[
                                styles.statusDot, 
                                isNow ? styles.statusDotActive : styles.statusDotInactive,
                                isNow && { opacity: pulseAnim }
                              ]} 
                            />
                            <Text style={styles.statusText} selectable>
                              {isNow ? "Available now" : "Available today"}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Bio Description */}
                      <Text style={styles.featuredBio} selectable>
                        "{reader.bio}"
                      </Text>

                      <Text style={styles.featuredSpecialty} selectable>
                        Specializes in {reader.specialty.toLowerCase()}.
                      </Text>

                      {/* Details row badges */}
                      <View style={styles.featuredDetailRow}>
                        <View style={styles.pillBadge}>
                          <Text style={styles.pillBadgeText}>★ {reader.rating}</Text>
                        </View>
                        <View style={styles.pillBadge}>
                          <Text style={styles.pillBadgeText}>{reader.sessions}</Text>
                        </View>
                        <View style={styles.pillBadge}>
                          <Text style={styles.pillBadgeText}>{reader.price}</Text>
                        </View>
                        {reader.tags.map((tag) => (
                          <View key={tag} style={styles.pillBadgeOutline}>
                            <Text style={styles.pillBadgeOutlineText}>{tag}</Text>
                          </View>
                        ))}
                      </View>

                      {/* Request CTA */}
                      <Animated.View style={{ transform: [{ scale: btnScaleVal }] }}>
                        <Pressable
                          onPress={() => handleRequestCall(reader.id)}
                          onPressIn={() => handleBtnPressIn(index)}
                          onPressOut={() => handleBtnPressOut(index)}
                          style={styles.featuredCTA}
                        >
                          <Text style={styles.featuredCTAText}>Request Call</Text>
                        </Pressable>
                      </Animated.View>
                    </Pressable>
                  </Animated.View>
                );
              }

              // COMPACT LIST GUIDE card layout
              return (
                <Animated.View
                  key={reader.id}
                  style={[
                    styles.compactCardWrapper,
                    {
                      opacity: opacityVal,
                      transform: [
                        { translateY: translateYVal },
                        { scale: cardScaleVal }
                      ]
                    }
                  ]}
                >
                  <Pressable
                    onPressIn={() => handleCardPressIn(index)}
                    onPressOut={() => handleCardPressOut(index)}
                    style={styles.compactCard}
                  >
                    <View style={styles.compactAvatarCol}>
                      <Image 
                        source={avatarImages[reader.id]} 
                        style={styles.compactAvatar} 
                        contentFit="cover"
                      />
                      <Animated.View 
                        style={[
                          styles.compactStatusDot, 
                          isNow ? styles.statusDotActive : styles.statusDotInactive,
                          isNow && { opacity: pulseAnim }
                        ]} 
                      />
                    </View>

                    <View style={styles.compactInfoCol}>
                      <View style={styles.compactNameRow}>
                        <Text style={styles.compactName} selectable>{reader.name}</Text>
                        <Text style={styles.compactSign} selectable>· {reader.sign}</Text>
                      </View>
                      <Text style={styles.compactSpecialty} numberOfLines={1} selectable>
                        {reader.specialty}
                      </Text>
                      
                      <View style={styles.compactBadgesRow}>
                        <Text style={styles.compactMetaItem}>★ {reader.rating}</Text>
                        <Text style={styles.compactMetaDivider}>·</Text>
                        <Text style={styles.compactMetaItem}>{reader.price}</Text>
                        <Text style={styles.compactMetaDivider}>·</Text>
                        <Text style={styles.compactMetaItem}>{reader.tags.join('/')}</Text>
                      </View>
                    </View>

                    <View style={styles.compactActionCol}>
                      <Animated.View style={{ transform: [{ scale: btnScaleVal }] }}>
                        <Pressable
                          onPress={() => handleRequestCall(reader.id)}
                          onPressIn={() => handleBtnPressIn(index)}
                          onPressOut={() => handleBtnPressOut(index)}
                          style={styles.compactRequestBtn}
                        >
                          <Text style={styles.compactRequestBtnText}>Request</Text>
                        </Pressable>
                      </Animated.View>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })
          )}
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerMoonGlyph: {
    fontFamily: 'CormorantGaramond-Regular',
    fontSize: 20,
    color: '#C8E6FF',
    opacity: 0.25,
    marginRight: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 24,
  },
  headerContainer: {
    gap: 4,
    paddingHorizontal: 4,
  },
  eyebrowText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 9,
    color: '#555555',
    letterSpacing: 2.5,
  },
  titleText: {
    fontFamily: 'CormorantGaramond-Regular',
    fontSize: 36,
    color: '#FFFFFF',
    lineHeight: 42,
    marginTop: 2,
  },
  subtitleText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#8A8A8A',
    lineHeight: 20,
    marginTop: 2,
  },
  filterBar: {
    marginHorizontal: -20,
  },
  filterBarContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
  filterChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  filterChipText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    color: '#8A8A8A',
  },
  filterChipTextActive: {
    color: '#000000',
  },
  listContainer: {
    gap: 16,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    lineHeight: 20,
  },
  featuredCardWrapper: {
    width: '100%',
  },
  featuredCard: {
    backgroundColor: '#080808',
    borderWidth: 1,
    borderColor: '#1C1C1C',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderCurve: 'continuous',
  },
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#040404',
    borderWidth: 1.5,
    borderColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  featuredAvatar: {
    width: '100%',
    height: '100%',
  },
  featuredHeaderMeta: {
    flex: 1,
    gap: 4,
  },
  featuredNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featuredName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  badgeFeatured: {
    backgroundColor: '#1C1C1C',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  badgeFeaturedText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 8,
    color: '#C8E6FF',
    letterSpacing: 0.5,
  },
  featuredSign: {
    fontFamily: 'DMSans-Bold',
    fontSize: 9,
    color: '#555555',
    letterSpacing: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotActive: {
    backgroundColor: '#2EA84F',
    shadowColor: '#2EA84F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  statusDotInactive: {
    backgroundColor: '#555555',
  },
  statusText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 11,
    color: '#8A8A8A',
  },
  featuredBio: {
    fontFamily: 'CormorantGaramond-Italic',
    fontSize: 18,
    color: '#C8E6FF',
    lineHeight: 24,
    marginTop: 2,
  },
  featuredSpecialty: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: '#8A8A8A',
    lineHeight: 18,
  },
  featuredDetailRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  pillBadge: {
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  pillBadgeText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 11,
    color: '#FFFFFF',
  },
  pillBadgeOutline: {
    borderWidth: 1,
    borderColor: '#1C1C1C',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  pillBadgeOutlineText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 11,
    color: '#555555',
  },
  featuredCTA: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
    marginTop: 4,
  },
  featuredCTAText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: '#000000',
  },
  compactCardWrapper: {
    width: '100%',
  },
  compactCard: {
    backgroundColor: '#080808',
    borderWidth: 1,
    borderColor: '#181818',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderCurve: 'continuous',
  },
  compactAvatarCol: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#040404',
    borderWidth: 1,
    borderColor: '#1E1E1E',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactAvatar: {
    width: '100%',
    height: '100%',
  },
  compactStatusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#080808',
  },
  compactInfoCol: {
    flex: 1,
    paddingLeft: 14,
    gap: 2,
    justifyContent: 'center',
  },
  compactNameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  compactName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  compactSign: {
    fontFamily: 'DMSans-Medium',
    fontSize: 10,
    color: '#555555',
  },
  compactSpecialty: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: '#8A8A8A',
  },
  compactBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  compactMetaItem: {
    fontFamily: 'DMSans-Medium',
    fontSize: 10,
    color: '#555555',
  },
  compactMetaDivider: {
    fontFamily: 'DMSans-Regular',
    fontSize: 10,
    color: '#333333',
    marginHorizontal: 4,
  },
  compactActionCol: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingLeft: 8,
  },
  compactRequestBtn: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
  compactRequestBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 11,
    color: '#C8E6FF',
  },
});
