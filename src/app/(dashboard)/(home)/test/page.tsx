import { ServerBlocks } from "@/blocks/renderers/server-blocks"

export default async function Page() {
  return (
    <div className="flex flex-col">

    <ServerBlocks
      blocks={[
    {
        "id": "davos",
        "type": "hero",
        "data": {
            "containers": [
                "cmk33r3kd0000tydcsrmxebdv",
                "cmkj0yt2g0008tyu0lqyhqq88",
                "cmjzm2ez50002ty8grbdm1jze"
            ]
        }
    },
    {
        "id": "2",
        "type": "media_row",
        "data": {
            "containers": [],
            "episodes": [
                "cmk33s81d0005tydcw0ux0ktt",
                "cmjzm3oc40003ty8gnngmic6j"
            ],
            "posterType": "poster",
            "showTitle": true,
            "title": "Nye filmer"
        }
    },
    {
        "id": "0j0xcM2HlU4_8CXi6HBWO",
        "type": "featured",
        "data": {
            "container": "cmjzm2ez50002ty8grbdm1jze"
        }
    },
    {
        "id": "EhfWRuZV7V2o7lwmNwwTC",
        "type": "media_row",
        "data": {
            "episodes": [
                "cmk33r3kd0000tydcsrmxebdv",
                "cmkj0yt2g0008tyu0lqyhqq88",
                "cmjzm2ez50002ty8grbdm1jze"
            ],
            "posterType": "video"
        }
    }
]}
      />
      </div>
  )
}
