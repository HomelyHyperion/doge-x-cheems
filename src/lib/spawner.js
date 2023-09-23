import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import sounds from "../media/sounds/*.mp3";
import glbs from "../media/3d/*.glb";

let models = {};

export let glbSrc = glbs;

export const preload = async () => {
  models.hotdog = await loadMesh(glbs.hotdog);
  models.cheems = await loadMesh(glbs.cheems);
  models.doge = await loadMesh(glbs.doge);
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

  return obj;
};
