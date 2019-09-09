import React, { Component, useState, useEffect } from "react";
import { Audio } from "expo-av";
import { Feather } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions
} from "react-native";

const playlist = [
  {
    id: "1",
    title: "Afterwards We'll See",
    artist: "Mid-Air Machine",
    album: "Isolation Isn't ~ Electronic Tracks",
    source: require("../AudioPlayer/assets/music/Mid-Air_Machine_-_Afterwards_Well_See.mp3")
  },
  {
    id: "2",
    title: "Storybook",
    artist: "Scott Holmes",
    album: "Inspiring & Upbeat Music",
    source: require("../AudioPlayer/assets/music/Scott_Holmes_-_01_-_Storybook.mp3")
  },
  {
    id: "3",
    title: "Driven To Success",
    artist: "Scott Holmes",
    album: "-",
    source: require("../AudioPlayer/assets/music/Scott_Holmes_-_Driven_To_Success.mp3")
  }
];

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackInstance, setPlaybackInstance] = useState(null);
  const [volume, setVolume] = useState(1);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const audioMapper = {};

  const loadAudio = async index => {
    const item = playlist[index];
    if (item == null) {
      return;
    }

    const status = {
      shouldPlay: isPlaying,
      volume: volume
    };
    const source = item.source;
    let playbackInstance;

    if (audioMapper.hasOwnProperty(item.id)) {
      playbackInstance = audioMapper[item.id];
    } else {
      playbackInstance = new Audio.Sound();
      playbackInstance.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      audioMapper[item.id] = playbackInstance;
    }

    // The third parameter dictates whether we want to wait for the file to finish downloading before it is played
    await playbackInstance.loadAsync(source, status, false);
    setPlaybackInstance(playbackInstance);
  };

  const onPlaybackStatusUpdate = status => {
    setIsBuffering(status.isBuffering);
  };

  useEffect(() => {
    async function setAudioModeAsync() {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        staysActiveInBackground: false,
        playThroughEarpieceAndroid: false
      });
      loadAudio(currentTrackIndex);
    }

    setAudioModeAsync();
  }, []);

  const handlePreviousTrack = async () => {
    if (playbackInstance) {
      await playbackInstance.unloadAsync();
      const newIndex =
        currentTrackIndex - 1 < 0 ? playlist.length - 1 : currentTrackIndex - 1;
      setCurrentTrackIndex(newIndex);
      loadAudio(newIndex);
    }
  };

  const handleNextTrack = async () => {
    if (playbackInstance) {
      await playbackInstance.unloadAsync();
      const newIndex =
        currentTrackIndex + 1 > playlist.length - 1 ? 0 : currentTrackIndex + 1;
      setCurrentTrackIndex(newIndex);
      loadAudio(newIndex);
    }
  };

  const handlePlayPause = async () => {
    isPlaying
      ? await playbackInstance.pauseAsync()
      : await playbackInstance.playAsync();
    setIsPlaying(!isPlaying);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.largeText, styles.buffer]}>
        {isBuffering && isPlaying ? "Buffering..." : null}
      </Text>
      {playbackInstance && (
        <SongInfo currentTrackIndex={currentTrackIndex} playlist={playlist} />
      )}
      <AudioControls
        handleNextTrack={handleNextTrack}
        handlePreviousTrack={handlePreviousTrack}
        handlePlayPause={handlePlayPause}
        isPlaying={isPlaying}
      />
    </View>
  );
}

function SongInfo(props) {
  const { currentTrackIndex, playlist } = props;
  return (
    <View style={styles.trackInfo}>
      <Text style={[styles.trackInfoText, styles.largeText]}>
        {playlist[currentTrackIndex].title}
      </Text>
      <Text style={[styles.trackInfoText, styles.largeText]}>
        {playlist[currentTrackIndex].artist}
      </Text>
      <Text style={[styles.trackInfoText, styles.largeText]}>
        {playlist[currentTrackIndex].album}
      </Text>
    </View>
  );
}

function AudioControls(props) {
  const {
    handleNextTrack,
    handlePreviousTrack,
    handlePlayPause,
    isPlaying
  } = props;

  return (
    <View style={styles.controls}>
      <TouchableOpacity style={styles.control} onPress={handlePreviousTrack}>
        <Feather name="skip-back" size={32} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.control} onPress={handlePlayPause}>
        {isPlaying ? (
          <Feather name="pause" size={32} color="#fff" />
        ) : (
          <Feather name="play" size={32} color="#fff" />
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.control} onPress={handleNextTrack}>
        <Feather name="skip-forward" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#191A1A",
    alignItems: "center",
    justifyContent: "center"
  },
  trackInfo: {
    padding: 40,
    backgroundColor: "#191A1A"
  },
  buffer: {
    color: "#fff"
  },
  trackInfoText: {
    textAlign: "center",
    flexWrap: "wrap",
    color: "#fff"
  },
  largeText: {
    fontSize: 22
  },
  smallText: {
    fontSize: 16
  },
  control: {
    margin: 20
  },
  controls: {
    flexDirection: "row"
  }
});
