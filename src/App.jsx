import React, { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import idl from "./idl/idl.json"
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, web3,Provider } from '@project-serum/anchor';
import kp from "./keypair/keypair.json"
import { Icon } from '@iconify/react';




// SystemProgram is a reference to the Solana runtime!
const { SystemProgram } = web3;

// Create a keypair for the account that will hold the GIF data.
const arr  = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
let baseAccount = web3.Keypair.fromSecretKey(secret);

// Get our program's id from the IDL file.
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed"
}




const App = () => {

  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [gifList, setGifList] = useState([]);

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');
          const response = await solana.connect({ onlyIfTrusted: true });
          console.log(
            'Connected with Public Key:',
            response.publicKey.toString()
          );
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
      createGifAccount();
    }
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new  Provider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }

  /*
   * We want to render this UI when the user hasn't connected
   * their wallet to our app yet.
   */
  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  const sendGif = async () => {
    if (inputValue.length > 0) {
      await createGif();
    } else {
      console.log('Empty input. Try again.');
    }
  };

  const liked = (likers) => {
    let iLiked = false;

    likers.map(userPubKey => {
      const provider = getProvider();
      console.log(provider.wallet.publicKey.toString() ==  userPubKey.toString())
      if(provider.wallet.publicKey.toString() == userPubKey.toString()){
        iLiked = true;
      }

    })
    return iLiked
   
  }
  
  const renderConnectedContainer = () => (
    <div className="connected-container">
      {/* Go ahead and add this input and button to start */}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          sendGif();
        }}
      >
        <input type="text" placeholder="Enter gif link!" required value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
        }}/>
        <button type="submit" className="cta-button submit-gif-button">Submit</button>
      </form>
      <div className="gif-grid">
        {gifList.map((gif,index) => {
          return (
            <div className="gif-item" key={index}>
              <img src={gif.gifLink} alt={gif} />
              <div className="flex items-center justify-center text-white">
                {
                 
                  liked(gif.likers) == true  ?  (
                    <Icon icon="bxs:like" className='cursor-not-allowed' color='white' height={30} />
                  ) : (
                    <Icon icon="ei:like" className='cursor-pointer'  color='white' height={40} onClick={
                      async () => {
                        await addLike(gif.gifLink);
                      }
                    } />
                  )
                }
                <span className=' font-bold text-lg' >{ gif.likers.length }</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
       
    )


  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping")
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });
      console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
      await getGifList();
  
    } catch(error) {
      console.log("Error creating BaseAccount account:", error)
    }
  }

  const createGif = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping")
      await program.rpc.addGif(inputValue,{
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        }
      });
      await getGifList();
  
    } catch(error) {
      console.log("Error creating BaseAccount account:", error.message)
    }
  }

  // getting gif list

  const getGifList = async() => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      setGifList(account.gifList);
    } catch (error) {
      console.log("Error in getGifList: ", error);
      setGifList([]);
    }
  } 

  
  const addLike = async (url) => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      await program.rpc.addLike(url,{
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        }
      });
      await getGifList();
  
    } catch(error) {
      console.log("Error creating BaseAccount account:", error.message)
    }
  }
  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching GIF list...');
      getGifList();
    }
  }, [walletAddress]);

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  return (
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          {!walletAddress && renderNotConnectedContainer()}
          
          {renderConnectedContainer()}
        </div>
      </div>
    </div>
  );
};

export default App;
