class MathUtils {
  public static degToRad(angle) {
    return angle * Math.PI / 180;
  }

  public static getProjecton(angle, a, zMin, zMax): Array<number> {
    var tan = Math.tan(MathUtils.degToRad(0.5 * angle));
    var A = (-1 * zMax * zMin) / (zMax - zMin);
    var B = (-2 * zMax * zMin) / (zMax - zMin);
    return [
    0.5 / tan , 0             , 0,  0 ,
    0         , 0.5 * a / tan , 0,  0 ,
    0         , 0             , A, -1 ,
    0         , 0             , B,  0 ,
    ];
  }

  public static getIdentity4(): Array<number> {
    return [1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            0,0,0,1];
  }

  public static rotateX(m, angle) {
    var c=Math.cos(angle);
    var s=Math.sin(angle);
    var mv1=m[1], mv5=m[5], mv9=m[9];
    m[1]=m[1]*c-m[2]*s;
    m[5]=m[5]*c-m[6]*s;
    m[9]=m[9]*c-m[10]*s;

    m[2]=m[2]*c+mv1*s;
    m[6]=m[6]*c+mv5*s;
    m[10]=m[10]*c+mv9*s;
  }

  public static rotateY(m, angle) {
    var c=Math.cos(angle);
    var s=Math.sin(angle);
    var mv0=m[0], mv4=m[4], mv8=m[8];
    m[0]=c*m[0]+s*m[2];
    m[4]=c*m[4]+s*m[6];
    m[8]=c*m[8]+s*m[10];

    m[2]=c*m[2]-s*mv0;
    m[6]=c*m[6]-s*mv4;
    m[10]=c*m[10]-s*mv8;
  }

  public static rotateZ(m, angle) {
    var c=Math.cos(angle);
    var s=Math.sin(angle);
    var mv0=m[0], mv4=m[4], mv8=m[8];
    m[0]=c*m[0]-s*m[1];
    m[4]=c*m[4]-s*m[5];
    m[8]=c*m[8]-s*m[9];

    m[1]=c*m[1]+s*mv0;
    m[5]=c*m[5]+s*mv4;
    m[9]=c*m[9]+s*mv8;
  }

  public static translateZ(m, t) {
    m[14] += t;
  }
}