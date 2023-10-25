import { useRef, useEffect, RefObject } from "react";
import { Scene, PerspectiveCamera, WebGLRenderer } from "three";

type Handle = (
  scene: Scene,
  camera: PerspectiveCamera,
  renderer: WebGLRenderer
) => void;

const useInitialize = (
  conatinerRef: RefObject<HTMLDivElement>,
  initializeHandle?: Handle | null,
  resizeHandle?: Handle | null,
  renderHandle?: Handle | null
) => {
  const sceneRef = useRef<Scene | null>(null);
  const cameraRef = useRef<PerspectiveCamera | null>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const frameId = useRef<number>(0);

  const render = () => {
    if (sceneRef.current && cameraRef.current && rendererRef.current) {
      renderHandle &&
        renderHandle(sceneRef.current, cameraRef.current, rendererRef.current);
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      frameId.current = window.requestAnimationFrame(render);
    }
  };

  const init = () => {
    if (conatinerRef.current) {
      const { clientWidth, clientHeight } = conatinerRef.current;

      // 创建场景
      const scene = new Scene();
      sceneRef.current = scene;

      // 创建相机
      const camera = new PerspectiveCamera(
        75,
        clientWidth / clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 0, 10);
      cameraRef.current = camera;

      // 创建渲染器
      const renderer = new WebGLRenderer({ antialias: true });
      rendererRef.current = renderer;
      renderer.setSize(clientWidth, clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.shadowMap.enabled = true;

      // 将Canvas插入到页面
      conatinerRef.current.append(renderer.domElement);

      // 渲染
      render();

      initializeHandle && initializeHandle(scene, camera, renderer);
    }
  };

  const onResize = () => {
    if (
      conatinerRef.current &&
      sceneRef.current &&
      cameraRef.current &&
      rendererRef.current
    ) {
      const { clientWidth, clientHeight } = conatinerRef.current;

      // 更新相机
      cameraRef.current.aspect = clientWidth / clientHeight;
      cameraRef.current.updateProjectionMatrix();

      // 更新渲染器
      rendererRef.current.setSize(clientWidth, clientHeight);

      // 设置渲染器的像素比
      rendererRef.current.setPixelRatio(window.devicePixelRatio);

      resizeHandle &&
        resizeHandle(sceneRef.current, cameraRef.current, rendererRef.current);
    }
  };

  useEffect(() => {
    init();
    window.addEventListener("resize", onResize);

    return () => {
      frameId.current && window.cancelAnimationFrame(frameId.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return {
    scene: sceneRef.current,
    camera: cameraRef.current,
    renderer: rendererRef.current,
    resize: onResize,
  };
};

export default useInitialize;
