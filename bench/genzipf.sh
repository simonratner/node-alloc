#!/usr/bin/env bash

basedir=$(dirname $0)/..

R=1
A=${1:-1.0}
N=${2:-65535}
NN=${3:-100000}

genzipf=$basedir/build/Release/genzipf
genzipf_out=$basedir/bench/zipf-$A-$N-$NN.dat

if [ -x $genzipf ]; then
  cat <<EOF | $genzipf >/dev/null
$genzipf_out
$R
$A
$N
$NN
EOF
  if [ $? -ne 0 ]; then
    echo $genzipf: error writing $genzipf_out >&2
    exit -2
  fi
else
  echo $genzipf: not executable >&2
  exit -1
fi
