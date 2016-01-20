require(data.table)
require(rjson)
setwd('~/Development/colab/yeast-crispri/gen_data/')


dat = as.data.frame( fread('full_features_2000_withaggr.tab') )
names(dat)[1] = 'Chrm'
names(dat)[4] = 'Seq'
names(dat)[5] = 'Nearest_TSS_ORF'


# Do TSS
tss = read.delim2('tss.txt', header=F, stringsAsFactors = F)
orf2tss = tss$V3
names(orf2tss) = tss$V1

json = sprintf('orf2tss = %s', toJSON(orf2tss))
writeLines(json, '../data/orf2tss.json')

dat = dat[,c(1,2,4,5,6,7,8,9,11)]

# Make chromosome name an integer instead of string
dat$Chrm = as.integer( as.roman( gsub('chr', '', dat$Chrm) ) )

# Set NaNs to -1
dat$Nucleosome[is.nan(dat$Nucleosome)] = -1
dat$Chromatin_rel_1kb[is.nan(dat$Chromatin_rel_1kb)] = -1

#dat = dat[1:5,]

writeLines(toJSON(dat), '../data/dat.json')


df = readRDS('orf_name_dataframe.rds')
df = df[df$orf != df$name & df$orf %in% dat$Nearest_TSS_ORF,]
name2orf = df$orf
names(name2orf) = df$name

orf2name = df$name
names(orf2name) = df$orf

json = toJSON(name2orf)
json = sprintf('var name2orf=%s', json)
writeLines(json, '../data/name2orf.json')

json = toJSON(orf2name)
json = sprintf('var orf2name=%s', json)
writeLines(json, '../data/orf2name.json')

# All data clean for bulk download!
if(F){
  
  dat2 = dat
  dat2$Length = nchar(dat2$Seq)
  dat2$Gene_name = ''
  dat2$ORF = dat2$Nearest_TSS_ORF
  dat2$Chromatin = dat2$Chromatin_rel_1kb
  df = dat2[,c('Chrm', 'PAM_mid', 'Seq', 'Length', 'ORF', 
               'Gene_name', 'Midpoint_TSS_dist', 'Nucleosome', 'Chromatin')]
  ind = df$ORF %in% names(orf2name)
  df$Gene_name[ind] = orf2name[ df$ORF[ind] ]
  df$Chrm = paste0('chr', as.numeric( as.roman( gsub('chr', '', df$Chrm) ) ))
  
  df$Nucleosome[is.nan(df$Nucleosome)] = -1
  df$score = 0
  score_a = (df$Midpoint_TSS_dist < 0 & df$Midpoint_TSS_dist >= -200)+0
  score_b = (df$Nucleosome != -1 & df$Nucleosome <= 0.2)+0
  df$score = score_a + score_b
  write.table(df, '../data/yeast_crispri_grna_db_191115.tab', quote=F, row.names=F, sep='\t')
  
}