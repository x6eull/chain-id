import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Stack, Typography } from "@mui/material";
import type { Route } from "./+types/home";
import { generateKeyPair, getApi } from "~/api";
import { useState } from "react";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "导航页" },
  ];
}

export async function clientLoader({ }: Route.ClientLoaderArgs) {

}

export default function Home({ loaderData }: Route.ComponentProps) {
  // const isLoggedIn = typeof loaderData.currentUser?.id === 'number';
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const openResetDialog = () => {
    setResetDialogOpen(true);
  };

  const closeResetDialog = () => {
    setResetDialogOpen(false);
  };
  return (<Stack height='100vh' direction='column' justifyContent='space-between' p='4rem 8rem'>
    <Stack direction='column' spacing={2}>
      <Typography variant='h3' align="center">欢迎使用</Typography>
      <Typography variant='h5' align="center" color="primary">分布式账号密码管理系统</Typography>
    </Stack>
    <Stack direction='column' spacing={2}>
      {isLoggedIn ? (<>
        <Grid container direction='row' spacing={2}>
          <Grid alignContent={'center'} size={4}>
            <Typography align="center">
              本地证书已初始化
            </Typography>
          </Grid>
          <Grid size={4}>
            <Button fullWidth variant="contained">查看公私钥</Button>
          </Grid>
          <Grid size={4}>
            <Button onClick={openResetDialog} fullWidth variant="contained" color="primary">重置证书</Button>
            <Dialog
              open={resetDialogOpen}
              onClose={closeResetDialog}
            >
              <DialogTitle >
                重置本地证书
              </DialogTitle>
              <DialogContent>
                <DialogContentText >
                  重置本地证书将删除所有账号密码数据，无法恢复，请谨慎操作。
                  <br />
                  确认要重置本地证书吗？
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={closeResetDialog}>取消</Button>
                <Button onClick={() => {
                  closeResetDialog();
                  setIsLoggedIn(false)
                }} autoFocus>
                  确定
                </Button>
              </DialogActions>
            </Dialog>
          </Grid>
        </Grid>
      </>) : (
        <Stack direction='row' spacing={2}>
          <Button onClick={async () => {
            await generateKeyPair();
            setIsLoggedIn(true)
          }} fullWidth variant="contained" color="primary">初始化本地证书</Button>
        </Stack>
      )}

    </Stack>
  </Stack>)
}
