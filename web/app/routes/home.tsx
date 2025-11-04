import { Button, Card, CardActions, CardContent, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, IconButton, List, ListItem, Popover, Stack, TextField, Tooltip, Typography } from "@mui/material";
import type { Route } from "./+types/home";
import { clearKeyPair, generateKeyPair, getApi, keyValid, loadKeyPair, publicKeyFingerprint } from "~/api";
import { useEffect, useMemo, useRef, useState } from "react";
import { useReloader } from "useReloader";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "chain-id" },
  ];
}

interface RecordEntry {
  url: string
  hide?: boolean
  detail?: {
    name: string
    username: string
    password: string
  }
}

const dummyRecords: RecordEntry[] = [
  { url: "example.com", detail: { name: "示例网站", username: "user1", password: "password1" } },
  { url: "testsite.org", detail: { name: "测试站点", username: "testuser", password: "testpass" } },
  { url: "myapp.net" },
].map(e => new Array(3).fill(0).map((_, i) => ({ ...e, url: i + '(test) ' + e.url }))).flat();

export default function Home({ }: Route.ComponentProps) {
  const keyExists = keyValid();
  const [reloader] = useReloader();
  useEffect(() => {
    loadKeyPair().then(reloader, console.error);
  }, []);

  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const openResetDialog = () => setResetDialogOpen(true);
  const closeResetDialog = () => setResetDialogOpen(false);

  const [keyViewOpen, setKeyViewOpen] = useState(false);
  const fingerprintAnchorEl = useRef<HTMLButtonElement | null>(null);

  const [filter, setFilter] = useState("");

  const [records, setRecords] = useState<RecordEntry[]>(() => dummyRecords);
  const filteredRecords = useMemo<RecordEntry[]>(() => records.filter((entry) => entry.url.indexOf(filter) >= 0 || (entry.detail?.username.indexOf(filter) ?? -1) >= 0 || (entry.detail?.name.indexOf(filter) ?? -1) >= 0), [records, filter]);

  return (<Stack height='100vh' overflow='hidden' direction='column' justifyContent='space-between' p='4rem 8rem' spacing={2}>
    <Stack overflow='hidden' direction='column' spacing={2}>
      <Typography variant='h3' align="center">欢迎使用</Typography>
      <Typography variant='h5' align="center" color="primary">分布式账号密码管理系统</Typography>
      <Stack overflow='auto'>
        <TextField
          label="搜索网址、用户名……"
          type="search"
          variant="filled"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <Stack overflow='hidden auto'>
          <List>
            {filteredRecords.map((entry, index) => (
              <ListItem sx={{ padding: '.25rem 0' }} key={index}  >
                <Card sx={{ width: '100%' }} variant="outlined" >
                  <CardContent>
                    <Stack justifyContent={'space-between'} alignItems={'center'} direction={'row'}>
                      <Stack direction={'column'}>
                        <Typography variant="h6">{entry.url}</Typography>
                        {entry.detail && !entry.hide ? (
                          <>
                            <Typography variant="body1" color="textSecondary">站点：{entry.detail?.name}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              用户名: {entry.detail.username}
                              {/* <br />
                              密码: {entry.detail.password} */}
                            </Typography>
                          </>) : (!entry.detail
                            ? <Typography variant="body2" color="textSecondary">数据加密保存于链上，可点击下载</Typography>
                            : <Typography variant="body2" color="textSecondary">详情已隐藏</Typography>)
                        }
                      </Stack>

                      <Stack direction={'column'}>
                        <Tooltip placement="right" title={entry.detail && !entry.hide ? "隐藏详情" : "显示详情"}>
                          <IconButton onClick={() => {
                            setRecords(prev => prev.map((e, i) => i === index ? { ...e, hide: !e.hide } : e));
                          }}>
                            {entry.detail && !entry.hide
                              ? <VisibilityOffIcon />
                              : <VisibilityIcon />
                            }
                          </IconButton>
                        </Tooltip>
                        <Tooltip placement="right" title="复制密码">
                          <IconButton>
                            <ContentCopyIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card >
              </ListItem>
            ))}
          </List>
        </Stack>
      </Stack>
    </Stack>
    <Stack direction='column' spacing={2}>
      {keyExists ? (<>
        <Grid container direction='row' spacing={2}>
          <Grid alignContent={'center'} size={4}>
            <Typography align="center">
              本地证书已初始化
            </Typography>
          </Grid>
          <Grid size={4}>
            <Button fullWidth ref={fingerprintAnchorEl} onClick={() => setKeyViewOpen(!keyViewOpen)} variant="contained">查看公钥指纹</Button>
            <Popover
              open={keyViewOpen}
              anchorEl={fingerprintAnchorEl.current}
              onClose={() => setKeyViewOpen(false)}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
            >
              <Typography sx={{ p: 2 }} whiteSpace='break-spaces'>
                公钥指纹: {publicKeyFingerprint}
              </Typography>
            </Popover>
          </Grid>
          <Grid size={4}>
            <Button onClick={openResetDialog} fullWidth variant="contained" color="primary">删除证书</Button>
            <Dialog
              open={resetDialogOpen}
              onClose={closeResetDialog}
            >
              <DialogTitle >
                删除本地证书
              </DialogTitle>
              <DialogContent>
                <DialogContentText >
                  删除本地证书将删除所有账号密码数据，无法恢复，请谨慎操作。
                  <br />
                  确认要删除本地证书吗？
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={closeResetDialog}>取消</Button>
                <Button onClick={() => {
                  closeResetDialog();
                  clearKeyPair();
                  reloader();
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
            reloader();
          }} fullWidth variant="contained" color="primary">初始化本地证书</Button>
        </Stack>
      )}

    </Stack>
  </Stack >)
}
