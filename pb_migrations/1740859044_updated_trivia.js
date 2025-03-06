/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_229117406")

  // update collection data
  unmarshal({
    "name": "snake"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_229117406")

  // update collection data
  unmarshal({
    "name": "trivia"
  }, collection)

  return app.save(collection)
})
