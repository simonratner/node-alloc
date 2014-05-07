{
  "target_defaults": {
    "configurations": {
      "Debug": {
        "defines": [ "DEBUG", "_DEBUG" ]
      },
      "Release": {
        "defines": [ "NDEBUG" ]
      }
    }
  },
  "targets": [
    {
      "target_name": "genzipf",
      "type": "executable",
      "sources": [
          "bench/genzipf.c",
      ],
    },
  ],
}
