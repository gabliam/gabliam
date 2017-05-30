# Gabliam core

Gabliam is on top of inversify.


# Gabliam phase

## Build phase

1. Load all config file (yml for the moment)
2. Load all file in scanPath of main
	- All decorators on class add metadata and can register this class
	- if an class has @scanPath, add this folder in queue for load
	- load all plugin
3. Bind classes in DI (inversify)
	- call all plugin.bind
4. load all config classes (order: CoreConfig => PluginConfig => config)
	- call all plugin.config for all instance of config class
5. Build
	- call all plugin.build

## Start phase
/!\ Build phase must be passed

1. call all plugin.start

## Stop phase
/!\ Build and start phases must be passed

1. call all plugin.start

## Detroy phase
/!\ Stop phase must be passed

1. call all plugin.detroy

# Samples
Go to [Samples]



# TODO LIST


todo list
- [ ] add readme
- [ ] add doc
- [ ] add tests
- [ ] add @Contraint for load class
- [ ] add before and after for config

[Samples]: <https://github.com/gabliam/sample>


- [x] delete express in core
