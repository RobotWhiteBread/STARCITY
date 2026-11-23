suppressMessages({library(cmfproperty);library(dplyr)})
d <- read.csv("sales.csv", colClasses=c(PIN="character")); d <- d[d$PTYPE=="Res" & d$INCITY==1,]; d$YR <- 2026
cat("rows",nrow(d),"\n"); d$RATIO0 <- d$ASSESSED_VALUE/d$SALE_PRICE
st <- function(x){ r<-x$ASSESSED_VALUE/x$SALE_PRICE; m<-median(r); c(n=nrow(x),median=round(m,3),COD=round(100*mean(abs(r-m))/m,2),PRD=round(mean(r)/(sum(x$ASSESSED_VALUE)/sum(x$SALE_PRICE)),4))}
cat("untrimmed\n"); print(st(d))
r <- reformat_data(d,"SALE_PRICE","ASSESSED_VALUE","YR",TRUE)
set.seed(1); s <- calc_iaao_stats(r); print(s)
cat("trim bounds",range(r$RATIO),"\n")
drop <- d[d$RATIO0<min(r$RATIO)|d$RATIO0>max(r$RATIO),]
cat("dropped",nrow(drop),"low",sum(drop$RATIO0<min(r$RATIO)),"high",sum(drop$RATIO0>max(r$RATIO)),"built2024+",sum(drop$YRBLT>=2024,na.rm=TRUE),"median ratio dropped",median(drop$RATIO0),"median price dropped",median(drop$SALE_PRICE),"\n")
ex <- d[!is.na(d$YRBLT) & d$YRBLT>0 & d$YRBLT<2024,]; cat("existing homes only, no trim\n"); print(st(ex))
nw <- d[!is.na(d$YRBLT) & d$YRBLT>=2024,]; cat("built 2024+ \n"); print(st(nw))
r$dec <- ntile(r$SALE_PRICE,10); print(r %>% group_by(dec) %>% summarize(n=n(),med_price=median(SALE_PRICE),med_ratio=round(median(RATIO),3)) %>% as.data.frame())
r$adec <- ntile((r$SALE_PRICE+r$ASSESSED_VALUE/median(r$RATIO))/2,10); print(r %>% group_by(adec) %>% summarize(med_ratio=round(median(RATIO),3)) %>% as.data.frame())
set.seed(7); a <- cmfproperty:::monte_carlo_sim(r, 20); cs <- cmfproperty:::get_stats(r,100)
for(k in c("COD","PRD","PRB")) cat(k, cs[[k]], "noise that reproduces it, %:", round(approxfun(a[[k]], a$shock_pct)(cs[[k]]),1), "\n")
print(regression_tests(r))
