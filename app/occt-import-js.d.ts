declare module "occt-import-js" {
    interface OcctMeshAttribute {
      array: number[];
    }
  
    interface OcctMesh {
      attributes: {
        position: OcctMeshAttribute;
        normal?: OcctMeshAttribute;
      };
      index?: OcctMeshAttribute;
    }
  
    interface OcctResult {
      success: boolean;
      meshes: OcctMesh[];
    }
  
    interface OcctInstance {
      ReadStepFile(buffer: Uint8Array, params: null): OcctResult;
    }
  
    interface OcctInitOptions {
      locateFile?: (path: string) => string;
    }
  
    function occtImportJs(options?: OcctInitOptions): Promise<OcctInstance>;
    export default occtImportJs;
  }