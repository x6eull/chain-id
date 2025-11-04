import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Stack, Typography } from "@mui/material";
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
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  return (<Stack height='100vh' direction='column' justifyContent='space-between' p='4rem 8rem'>
    <Typography variant='h3' align="center" color="primary">欢迎使用</Typography>
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
          <Grid size={6}>
            <Button fullWidth variant="contained" onClick={() => setOtpDialogOpen(true)}>获取OTP</Button>
            <Dialog
              open={otpDialogOpen}
              onClose={() => setOtpDialogOpen(false)}
            >
              <DialogTitle>
                生成新的一次性密码
              </DialogTitle>
              <DialogContent>
                <DialogContentText>
                  即将生成新的一次性密码（OTP）。
                  <br />
                  OTP可在合作网站使用以进行手机号绑定。绑定后其可随时查询您的手机号。
                  <br />
                  生成新OTP会使旧OTP失效。
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOtpDialogOpen(false)}>取消</Button>
                <Button onClick={() => setOtpDialogOpen(false)} autoFocus>生成</Button>
              </DialogActions>
            </Dialog>
          </Grid>
          <Grid size={6} >
            <Button fullWidth variant="contained">查询授权列表</Button>
          </Grid>
        </Grid>

        <Button href="/thirdparty" fullWidth variant="contained">前往第三方网站</Button>
      </>) : (
        <Button onClick={() => setIsLoggedIn(!isLoggedIn)} fullWidth variant="contained" color="primary">登录</Button>
      )}

    </Stack>
  </Stack>)
}
