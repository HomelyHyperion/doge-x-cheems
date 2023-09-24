import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const sounds = {
    explosion: "src/media/sounds/explosion.mp3", 
    laser: "src/media/sounds/laser.mp3",
    squelch: "src/media/sounds/squelch.mp3",
    tick: "src/media/sounds/tick.mp3",
    tock: "src/media/sounds/tock.mp3",
    undo: "src/media/sounds/undo.mp3"
};
const glbs = {
    hotdog: "src/media/3d/hotdog.glb",
    cheems: "src/media/3d/cheems.glb",
    doge: "src/media/3d/doge.glb",
    nouns: "src/media/3d/nouns.glb"
}

let models = {};

export let glbSrc = glbs;

export const preload = async () => {
  models.hotdog = await loadMesh(glbs.hotdog);
  models.cheems = await loadMesh(glbs.cheems);
  models.doge = await loadMesh(glbs.doge);
  models.nouns = await loadMesh(glbs.nouns);
};

export let loadMesh = async (url) => {
  const gltf = await modelLoader(url);
  return gltf.scene.children[0];
};

const loader = new GLTFLoader();

const modelLoader = (url) => {
  return new Promise((resolve, reject) => {
    loader.load(url, (data) => resolve(data), null, reject);
  });
};

export const spawn = (thing) => {
  let obj = {};

  if (thing === "hotdog") {
    let hotdog = models.hotdog.clone();
    hotdog.rotation.set(0, Math.random() * 10, 0);
    obj.mesh = hotdog;
    obj.sound = sounds.squelch;
    obj.mass = 2;
    obj.rDamp = 0.01 + Math.random() * 0.03;
  }

  if (thing === "cheems") {
    let cheems = models.cheems.clone();
    cheems.rotation.set(0, Math.random() * 10, 0);
    obj.mesh = cheems;
    obj.sound = sounds.laser;
    obj.mass = 1;
    obj.rDamp = 0.01 + Math.random() * 0.03;
  }

  if (thing === "doge") {
    let doge = models.doge.clone();
    doge.rotation.set(0, Math.random() * 10, 0);
    obj.mesh = doge;
    obj.sound = sounds.laser;
    obj.mass = 1;
    obj.rDamp = 0.01 + Math.random() * 0.03;
  }

  if (thing === "nouns") {
    let nouns = models.nouns.clone();
    nouns.rotation.set(0, Math.random() * 10, 0);
    obj.mesh = nouns;
    obj.sound = sounds.laser;
    obj.mass = 1;
    obj.rDamp = 0.01 + Math.random() * 0.03;
  }

  return obj;
};
