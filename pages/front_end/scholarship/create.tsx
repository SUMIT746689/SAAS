import { Authenticated } from '@/components/Authenticated';
import ExtendedSidebarLayout from '@/layouts/ExtendedSidebarLayout';
import { Button, Input, TextField } from '@mui/material';
import { useState } from 'react';
import { useClientFetch } from '@/hooks/useClientFetch';
import axios from 'axios';
import { NewHTTPClient } from '@/lib/HTTPClient';

// todo: enhance user experience
const  Packages = () => {
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState(null)
  const [duration, setDuration] = useState(null)
    // useClientFetch('/api/packages', 'POST')
  const handleSubmit = async (e) => {
    e.preventDefault()

    const [res, err] = await NewHTTPClient().SetPath("/api/packages").SetBody({
      title: e.target.title.value,
      price: e.target.price.value,
      duration: e.target.duration.value,
    }).Post()
    if (err) {
      console.log(err);
      return
    }

  }
  return (
    <>
      <div>
        <form className={'flex flex-col gap-8 max-w-fit mx-auto mt-12'} onSubmit={handleSubmit}>
          <TextField label={"Title"} name={'title'} required={true} />
          <TextField label={'Price'} type={'number'} required={true} name={'price'}/>
          <TextField label={'Duration'} type={'number'} required={true} name={'duration'}/>
          <Button variant={"contained"} type={'submit'}>Submit</Button>
        </form>
      </div>
    </>
  )
}

Packages.getLayout = (page) => (
  <Authenticated name="package">
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default Packages