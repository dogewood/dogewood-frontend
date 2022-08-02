import { AppProps } from "next/app"
import Layout from "layout"
import "styles/globals.css"

import "vendor/index.scss"
import "vendor/home.scss"
import { DefenderContextProvider } from "store/store"
import { Toaster } from "react-hot-toast"

import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloProvider,
} from "@apollo/client"

const client = new ApolloClient({
  link: new HttpLink({
    uri: "https://api.thegraph.com/subgraphs/name/dogewood/dogewood-polygon-subgraph",
    // uri: "https://api.thegraph.com/subgraphs/name/dogewood/dogewood-mumbai-subgraph",
  }),
  cache: new InMemoryCache(),
})

function App({ Component, router }: AppProps) {
  return (
    <DefenderContextProvider>
      <ApolloProvider client={client}>
        <Layout
          router={router}
          networks={process.env.APP_ENV === "dev" ? [5] : [1]}
        >
          <Component />
        </Layout>
      </ApolloProvider>
      <Toaster
        toastOptions={{
          className: "",
          style: {
            border: "1px solid #fff",
            padding: "8px 12px",
            color: "#333",
            fontWeight: "bold",
          },
        }}
      />
    </DefenderContextProvider>
  )
}

export default App
