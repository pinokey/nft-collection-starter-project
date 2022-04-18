import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import React, {useEffect,useState} from "react";
import {ethers} from "ethers";
import myEpicNft from "./utils/MyEpicNFT.json";
import { Logger } from 'ethers/lib/utils';
//取説はsolのjsonを持ってきてweb青ウリケーション側に貼らないといけないのだ。
// Constantsを宣言する: constとは値書き換えを禁止した変数を宣言する方法です。
const TWITTER_HANDLE = 'naka_aib';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
let TOTAL_MINT_COUNT = 10;
const CONTRACT_ADDRESS = 　"0x19056c14e248ABDD1ca2540D8c8A838c273fC21f";

const App = () => {
  //ウォレットアドレスを格納するために使用する状態変数と、状態変数を変化させる関数の定義
  const [currentAccount, setCurrentAccount] = useState("");
  const [currentTokenId, setCurrentTokenId] = useState("");
  console.log("currentAccount: ", currentAccount);

  //addressを持っているか確認
  const checkIfWalletIsConnected = async () => {
    const {ethereum} = window;
    //小要素を代入する記法
    if (!ethereum) {
      console.log("make sure you have metamask!!!");
      return;
    } else {
      console.log("we have the ethereum object", ethereum);
    }
  //ウォレットアドレスを持っている場合はアクセス許可を求める
  //許可されればユーザーの最初のウォレットアドレスをaccountに格納
    const accounts = await ethereum.request({method: "eth_accounts"});
    console.log(accounts);
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      //eventlistenerを設定
      setupEventListener();
      let chainId = await ethereum.request({ method: "eth_chainId" });
      console.log("Connected to chain " + chainId);
      // 0x4 は　Rinkeby の ID です。
      const rinkebyChainId = "0x4";
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
      } 
    } else {
      console.log("No authorized account found");
    }
    
  };

  //mintされるたびに（eventがemitされるたびに）情報を受け取る関数を定義する
  const setupEventListener = async () => {
    try {
      const {ethereum} = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        //  NFTの発行
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        //とりあえずここでもtokeid取得してしまっていいのでは？？
        let TOTAL_MINT_COUNT = await connectedContract.NftCollectionMax();
        TOTAL_MINT_COUNT = TOTAL_MINT_COUNT.toNumber();

        let currentTokenId = await connectedContract.tokenCount();
//        let currentTokenId = currentTokenId.toNumber();
        console.log("currenttokenid", currentTokenId.toNumber());
        setCurrentTokenId(currentTokenId.toNumber());
        

        //let TOTAL_MINT_COUNT = await connectedContract.NftCollectionMax().toString();
        console.log("Total mint count: ", TOTAL_MINT_COUNT);
        //eventがemitされるたびにコントラクトから送信される情報を受け取っている
        //ethersのメソッドのon
        //lishetenrとして関数を定義している
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          setCurrentTokenId(tokenId.toNumber());
      
          alert(
            `nft送ったデー。openseanに表示されるまで最大10分待つべし。リンクはこち : https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });
        console.log("eventlisneer setup!");
      } else {
        console.log("eth obj doesnt exist");
      }
    } catch (error) {
      console.log(error);
    }
  };

  //connectwalletmethodを定義
  const connectWallet = async () => {
    try {
      const {ethereum} = window;
      if (!ethereum) {
        alert("get your wallet!!");
        return;
      }
      //許可を求める部分がここ
      const accounts = await ethereum.request({
        method: "eth_requestAccounts" ,
        }
      );
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };
  
  //askcontract関数
  const askContractToMintNft = async () => {
    try {
      const {ethereum} = window;
      if (ethereum) {
         //providerを介してethのネットワークに接続
        const provider = new ethers.providers.Web3Provider(ethereum);
        //ユーザーのウォレットアドレスを抽象化getSignerを呼び出すだけでトランザクションに署名して、ethネットワークに送信することができる
        //signerを渡す→読み書き/providerを渡す→読みだけ
        //abiはこと楽ととwebアプリの通信の取説

        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        console.log("Going to pop wallet now to pay gas");
        let nftTxn = await connectedContract.makeAnEpicNFT();
        console.log("mining plz wait");
        await nftTxn.wait();
        console.log(`mined see txn https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
      } else {
        console.log("ethereum object doesntexist!!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  // renderNotConnectedContainer メソッドを定義します。
  const renderNotConnectedContainer = () => (
    <button 
      onClick={connectWallet}
      className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );
  
  //描画の時に行う処理[]で初回のみ、非同期通信でmetamaskのapiからとってくる
    useEffect(() => {
      checkIfWalletIsConnected();

    }, []);
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            あなただけの特別な NFT を Mint しよう💫
          </p>
          <p className="mints-number">発行数：{currentTokenId}/{TOTAL_MINT_COUNT}</p> 
          {/*条件付きレンダリングを追加しました
          // すでに接続されている場合は、
          // Connect to Walletを表示しないようにします。*/}
          {currentAccount === "" ? (
            renderNotConnectedContainer()
            ) : (
            <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
              mint NFT
            </button>
          )}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
