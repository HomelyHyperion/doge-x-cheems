import * as THREE from "three";
import { ARButton } from "/src/lib/ARButton.js";
import { Howl } from "howler";
import { Item } from "/src/lib/Item.js";
import { preload, loadMesh, glbSrc } from "/src/lib/spawner.js";

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi'

import { mainnet, goerli } from '@wagmi/core/chains'
import { getAccount, sepolia } from '@wagmi/core'

// 1. Define constants
const projectId = '18e35bd4d56a0c39358ca2f60f0baf00'

// 2. Create wagmiConfig
const chains = [goerli, sepolia, mainnet]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, appName: 'Web3Modal' })

// 3. Create modal
const modal = createWeb3Modal({ wagmiConfig, projectId, chains })

// media assets
const iconFiles = ["src/media/2d/icons/hotdog.png", "src/media/2d/icons/cheems.png", "src/media/2d/icons/doge.png", "src/media/2d/icons/nouns.png"]
const soundFiles = ["src/media/sounds/explosion.mp3", "src/media/sounds/laser.mp3", "src/media/sounds/squelch.mp3", "src/media/sounds/tick.mp3", "src/media/sounds/tock.mp3", "src/media/sounds/pop.mp3"];

// gif
import explosionGifSrc from "/src/media/2d/gif/explosion.gif";

// preload sounds
let sounds = {};
sounds.explosion = new Howl({ src: [soundFiles.explosion] });
sounds.pop = new Howl({ src: [soundFiles.pop] });
sounds.tick = new Howl({ src: [soundFiles.tick] });
sounds.tock = new Howl({ src: [soundFiles.tock] });

// convert icons to array
const iconSRC = Object.keys(iconFiles).map(function (key) {
  return iconFiles[key];
});

let icons = [];
let deviceRotation = { x: 0, y: 0, z: 0 };

// preload images
iconSRC.map((src) => {
  const img = new Image();
  img.src = src;
  icons.push(img);
});

// load random icon
let iconIndex = Math.floor(Math.random() * icons.length);
let icon = icons[iconIndex].src;

// init three js
let container;
let camera, scene, renderer;
let controller;
let reticle, pointer;

let hitTestSource = null;
let hitTestSourceRequested = false;

let isUI = false;
let isTracked = false;
let isStarted = false;
let floater = null;
let items = [];
let lat = 0;
let long = 0;

// set gravity
const gravity = new THREE.Vector3(0, -0.01, 0);

const init = () => {
  container = document.createElement("div");
  document.body.appendChild(container);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    alert("Geolocation is not supported by this browser.");
  }

  function showPosition(position) {
    lat = position.coords.latitude;
    long = position.coords.longitude;
  }

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1.5);
  light.position.set(0.5, 1, 1);
  scene.add(light);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  container.appendChild(renderer.domElement);

  document.body.appendChild(
    ARButton.createButton(renderer, {
      requiredFeatures: ["hit-test"],
      optionalFeatures: ["dom-overlay"],
      domOverlay: { root: document.getElementById("overlay") },
    })
  );

  window.addEventListener("deviceorientation", handleOrientation, true);

  const onSelect = () => {
    if (isUI) {
      isUI = false;
    } else {
      if (reticle.visible) {
        const height = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld).y;
        const pos = new THREE.Vector3().setFromMatrixPosition(reticle.matrix);
        const thing = icon.split("/").reverse()[0].split(".")[0];

        let item = new Item(pos, height, thing);

        scene.add(item.mesh);
        items.push(item);

        const nav = document.querySelector("nav");
        if (nav.classList.contains("hidden")) nav.classList.remove("hidden");
      }
    }
  };

  controller = renderer.xr.getController(0);
  controller.addEventListener("select", onSelect);
  scene.add(controller);

  reticle = new THREE.Mesh(
    new THREE.RingBufferGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial()
  );
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;

  pointer = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.02),
    new THREE.MeshLambertMaterial({ color: 0xcccccc })
  );
  pointer.visible = false;

  scene.add(pointer);
  scene.add(reticle);

  window.addEventListener("resize", onWindowResize, false);

  // start with random icon
  document.querySelector(".icon").setAttribute("src", icon);

  // splash screen
  loadMesh(glbSrc.cheems).then((mesh) => {
    scene.background = new THREE.Color(0x000000);
    floater = mesh.clone();
    floater.scale.copy(new THREE.Vector3(0.03, 0.03, 0.03));
    floater.rotation.set(0, 0, 0);
    // Y↑ X→ Z↙
    floater.position.set(0, -0.7, -0.7);
    camera.lookAt(floater.position);
    scene.add(floater);
    camera.position.set(0, -0.38, 0);

    // hide loader
    document.querySelector(".cool-stuff").classList.remove("hidden");
    document.querySelector(".loader").classList.add("hidden");
    document.querySelector("#ARButton").style.visibility = "visible";
  });

  preload().then(() => {
    console.log("models loaded!");
  });
};
// end of init

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

const love = () => {
  if (items.length > 0) {
    document.querySelector("nav").classList.add("hidden");

    window.setTimeout(() => {
      window.navigator.vibrate(40);
    }, 200);

    const account = getAccount();
    
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        Authorization: '36fd2c70-df11-4b3b-9bc7-de9c7b257053'
      },
      body: JSON.stringify({
        chain: 'goerli',
        name: 'ETHGlobalNYC',
        description: `[${lat}, ${long}]`,
        file_url: 'https://ipfs.io/ipfs/bafkreicaamlvvsn6v2up5lf2i5xawixfxbzbxt6hl7pfmrhdglbi36a7iq',
        mint_to_address: account.address
      })
    };
    
    fetch('https://api.nftport.xyz/v0/mints/easy/urls', options)
      .then(response => response.json())
      .then(response => {
        window.location.href = response.transaction_external_url;
      })
      .catch(err => {
        document.querySelector("nav").classList.remove("hidden");
        console.error(err);
      });

    isUI = true;
    sounds.pop.play();
  }

  // hide ui
  if (items.length === 0) {
    document.querySelector("nav").classList.add("hidden");
  }
};

const bomb = () => {
  isUI = true;
  sounds.explosion.play();
  let explGif = new Image();
  explGif.src = explosionGifSrc + "?z=" + Math.random();
  
  let gif = document.createElement("img");
  gif.setAttribute("src", explGif.src);
  document.querySelector(".gifcontainer").appendChild(gif);
  
  window.setTimeout(() => {
    items.map((ball) => { scene.remove(ball.mesh); });
    items = [];
    renderer.renderLists.dispose();
    document.querySelector("nav").classList.add("hidden");
    window.navigator.vibrate(1000);
  }, 400);
  
  window.setTimeout(() => {
    document.querySelector(".gifcontainer").innerHTML = "";
  }, 1200);
};

const nextIcon = () => {
  iconIndex++;
  sounds.tick.play();
  updateIcon();
};

const prevIcon = () => {
  iconIndex--;
  sounds.tock.play();
  updateIcon();
};

const updateIcon = () => {
  isUI = true;
  const i = Math.abs(iconIndex % icons.length);
  icon = icons[i].src;
  document.querySelector(".icon").setAttribute("src", icon);
  window.navigator.vibrate(40);
};

const toggleHints = () => {
  const hints = document.querySelector(".hints");
  const bottom = document.querySelector(".bottom");
  const nav = document.querySelector("nav");

  if (hints.classList.contains("hidden")) {
    hints.classList.remove("hidden");
    bottom.classList.add("hidden");
    nav.classList.add("hidden");
  } else {
    if (items.length > 0) nav.classList.remove("hidden");
    hints.classList.add("hidden");
    bottom.classList.remove("hidden");
  }
};

const handleOrientation = (event) => {
  var absolute = event.absolute;
  var alpha = event.alpha;
  var beta = event.beta;
  var gamma = event.gamma;

  deviceRotation.x = beta;
  deviceRotation.y = gamma;
  deviceRotation.z = alpha;
};

function animate() {
  renderer.setAnimationLoop(render);
}

function render(timestamp, frame) {
  if (!isStarted) {
    if (floater !== null)
      floater.rotation.set(deviceRotation.x * 0.02 - 45, (floater.rotation.y += 0.015), 0);
  } else {
    if (floater !== null) {
      scene.remove(floater);
      camera.position.set(0, 0, 0);
      floater = null;
      window.removeEventListener("deviceorientation", handleOrientation, true);
    }
    if (frame) {
      const referenceSpace = renderer.xr.getReferenceSpace();
      const session = renderer.xr.getSession();

      if (hitTestSourceRequested === false) {
        session.requestReferenceSpace("viewer").then(function (referenceSpace) {
          session.requestHitTestSource({ space: referenceSpace }).then(function (source) { hitTestSource = source; });
        });

        session.addEventListener("end", function () {
          hitTestSourceRequested = false;
          hitTestSource = null;
        });

        hitTestSourceRequested = true;
      }

      if (hitTestSource) {
        const hitTestResults = frame.getHitTestResults(hitTestSource);
        if (hitTestResults.length) {
          const hit = hitTestResults[0];
          reticle.visible = true;
          pointer.visible = true;
          reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);
          const reticlePos = new THREE.Vector3().setFromMatrixPosition(reticle.matrix);
          const cameraPos = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);

          pointer.position.copy(reticlePos);
          pointer.position.y = cameraPos.y;

          if (!isTracked) {
            isTracked = true;
            toggleHints();
            document.querySelector(".subhint").classList.remove("hidden");
            window.setTimeout(() => {
              document.querySelector(".subhint").remove();
            }, 8000);
          }
        } else {
          reticle.visible = false;
          pointer.visible = false;
        }
      }
    }

    // update items
    for (let i = 0; i < items.length; i++) {
      items[i].applyForce(gravity);
      items[i].update();
    }
  }

  renderer.render(scene, camera);
}

// LFD ✨
init();

renderer.xr.addEventListener("sessionstart", function (event) {
  document.querySelector("#overlay").classList.remove("hidden");
  scene.background = null;
  isStarted = true;
  document.querySelector("#splash").remove();
  console.log("scene started");
});

document.querySelector(".love").onclick = love;
document.querySelector(".bomb").onclick = bomb;
document.querySelector(".prev").onclick = prevIcon;
document.querySelector(".next").onclick = nextIcon;

// Yay 🎨
animate();
