import './App.css';
import LinkCard from './components/LinkCard';
import { useEffect, useState } from 'react';
import { axiosDelete, axiosGet, axiosPost } from './AxiosService';
import Toast from './components/Toast';
import { toast } from 'react-toastify';

function App() {
  const [data, setData] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [render, setRender] = useState(false);
  const [copied, setIsCopied] = useState(false);

  const validateUrl = (input) => {
    const urlRegex = new RegExp(/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i);
    return urlRegex.test(input);
  };

  const handleShortenUrl = () => {
    if (!validateUrl(userInput)) {
      toast.error('Please enter a valid URL.');
      return;
    }
  
    axiosPost('shorturl', { originUrl: userInput })
      .then(res => {
        console.log(res.data);
        setRender(!render);
        toast.success('URL shortened successfully.');
      })
      .catch(handleError);
  };
  
  const handleError = err => {
    console.log(err);
    if (err.response && err.response.data === 'Rate limit exceeded') {
      handleRateLimitExceeded();
    } else {
      handleOtherErrors();
    }
  };
  
  const handleRateLimitExceeded = () => {
    toast.error('Only 20 requests are allowed per hour.Please try again after some time.');
  };
  
  const handleOtherErrors = () => {
    toast.error('Failed to shorten URL.');
  };
  

  const handleDeleteUrl = (id) => {
    axiosDelete(`deleteurl/${id}`)
      .then(res => {
        console.log(res);
        setRender(!render);
      })
      .catch(err => console.log(err));
  };
  

  useEffect(() => {
    axiosGet('allurls')
      .then(res => setData(res.data))
      .catch(err => console.log(err));
  }, [render]);

  return (
    <div className="App flex flex-col items-center justify-center" style={{ backgroundColor: '#111827', minHeight: '100vh' }}>
      <div className='max-w-[1360px] mt-4'>
        <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-white md:text-5xl lg:text-6xl dark:text-white animate-bounce">
          <span class="text-blue-600 dark:text-blue-500 hover:scale-125">TRIM</span>SEA<span class="text-blue-600 dark:text-blue-500"></span>
        </h1>
      </div>
      <div className='flex'>
        <div className=''>
          <div className='flex items-center justify-center gap-10 mt-10'>
            <input
              onChange={(e) => setUserInput(e.target.value.trim())}
              type="text"
              className='shadow-sm appearance-none border rounded py-4 px-5 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              style={{ width: '18rem' }}
              placeholder='Enter link here' />
            <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded focus:outline-none focus:shadow-outline'
              onClick={handleShortenUrl}>
              ShrinkURL</button>
          </div>
          <div className='flex flex-col gap-4 w-full justify-center items-center mt-10' style={{ backgroundColor: '#111827' }}>
            {
              data && data.map((url) =>
                <LinkCard
                  key={url._id}
                  urlDetails={url}
                  handleDeleteUrl={handleDeleteUrl}
                  setIsCopied={setIsCopied}
                />
              )
            }
          </div>
        </div>
      </div>
      {
        copied && <Toast />
      }
    </div>
  );
}

export default App;
