declare module 'face-api.js' {
  export class TinyFaceDetectorOptions {
    constructor(options?: { inputSize?: number; scoreThreshold?: number })
  }

  export interface FaceDetectionBox {
    x: number
    y: number
    width: number
    height: number
  }

  export interface FaceLandmarks {
    positions: Array<{ x: number; y: number }>
  }

  export interface FaceDetection {
    detection: { box: FaceDetectionBox; score?: number }
    landmarks: FaceLandmarks
    descriptor: Float32Array
  }

  export interface FaceDetectionLandmarksOnly {
    detection: { box: FaceDetectionBox; score?: number }
    landmarks: FaceLandmarks
  }

  export interface LabeledFaceDescriptors {
    label: string
    descriptors: Float32Array[]
  }

  type AfterLandmarks = PromiseLike<FaceDetectionLandmarksOnly | undefined> & {
    withFaceDescriptor(): Promise<FaceDetection | undefined>
  }

  type DetectChain = {
    withFaceLandmarks(): AfterLandmarks
    withFaceDescriptor(): Promise<FaceDetection | undefined>
  }

  type AfterLandmarksAll = PromiseLike<FaceDetection[]> & {
    withFaceDescriptors(): Promise<FaceDetection[]>
  }

  type DetectAllChain = PromiseLike<Array<{ score?: number }>> & {
    withFaceLandmarks(): AfterLandmarksAll
  }

  export const nets: {
    tinyFaceDetector: { loadFromUri(uri: string): Promise<void> }
    faceLandmark68Net: { loadFromUri(uri: string): Promise<void> }
    faceRecognitionNet: { loadFromUri(uri: string): Promise<void> }
  }

  export function detectSingleFace(
    input: HTMLVideoElement | HTMLCanvasElement,
    options?: TinyFaceDetectorOptions,
  ): DetectChain

  export function detectAllFaces(
    input: HTMLVideoElement | HTMLCanvasElement,
    options?: TinyFaceDetectorOptions,
  ): DetectAllChain

  export function euclideanDistance(a: Float32Array, b: Float32Array): number

  export const FaceMatcher: new (
    labeledDescriptors: LabeledFaceDescriptors[],
    distanceThreshold?: number,
  ) => {
    findBestMatch(descriptor: Float32Array): { label: string; distance: number }
  }
}
