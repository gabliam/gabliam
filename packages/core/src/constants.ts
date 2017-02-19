const TYPE = {
    Controller: Symbol("Controller"),
    Service: Symbol("Service"),
    Config: Symbol("Config")
};

const METADATA_KEY = {
    controller: "_controller",
    controllerMethod: "_controller-method",
    Bean: "_bean",
};

const DEFAULT_ROUTING_ROOT_PATH = "/";

export { TYPE, METADATA_KEY, DEFAULT_ROUTING_ROOT_PATH };