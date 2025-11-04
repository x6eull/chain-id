import { Button, Grid, Stack, Typography } from "@mui/material";
import type { Route } from "./+types/home";
import { getApi } from "~/api";
import { useState } from "react";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "导航页" },
  ];
}

export async function clientLoader({ }: Route.ClientLoaderArgs) {
  return { currentUser: await getApi<{ id: number } | null>('/current-user') };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  // const isLoggedIn = typeof loaderData.currentUser?.id === 'number';
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  return (<Stack height='100vh' direction='column' justifyContent='space-between' p='4rem 8rem'>
    <Stack direction='column' spacing={2}>
      <Typography variant='h3' align="center">欢迎使用</Typography>
      <Typography variant='h5' align="center" color="primary">分布式个人信息授权系统</Typography>
    </Stack>
    <Stack direction='column' spacing={2}>
      {isLoggedIn ? (<>
        <Grid container direction='row' spacing={2}>
          <Grid alignContent={'center'} size={4}>
            <Typography align="center">
              已登录：{loaderData.currentUser!.id}
            </Typography>
          </Grid>
          <Grid size={4} >
            <Button fullWidth variant="contained">更新信息</Button>
          </Grid>
          <Grid size={4}>
            <Button onClick={() => setIsLoggedIn(!isLoggedIn)} fullWidth variant="contained" color="primary">退出登录</Button>
          </Grid>
        </Grid>

        <Grid container direction='row' spacing={2}>
          <Grid size={6} >
            <Button href="/thirdparty" fullWidth variant="contained">前往第三方网站</Button>
          </Grid>
          <Grid size={6} >
            <Button fullWidth variant="contained">查询授权列表</Button>
          </Grid>
        </Grid>

      </>) : (
        <Stack direction='row' spacing={2}>
          <Button onClick={() => setIsLoggedIn(!isLoggedIn)} fullWidth variant="contained" color="primary">注册</Button>
          <Button onClick={() => setIsLoggedIn(!isLoggedIn)} fullWidth variant="contained" color="primary">登录</Button>
        </Stack>
      )}

    </Stack>
  </Stack>)
}
