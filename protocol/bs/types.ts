export type BsDataType =
/** 0-byte unit types */
  'void' | 'custom' |

/** 1-byte unit types */
  'u8' | 'i8' | 'bool' | 'char' |
/** 1-byte unit array types */
  'u8[]' | 'i8[]' | 'bool[]' | 'string' | 'json' |

/** 2-byte unit types */
  'u16' | 'i16' |

/** 2-byte unit array types */
  'u16[]' | 'i16[]' |

/** 3-byte unit types */
  'rgb' | 'hsv' |

/** 3-byte unit array types */
  'rgb[]' | 'hsv[]' |

/** 4-byte unit types */
  'u32' | 'i32' | 'float' | 'rgbw' |

/** 4-byte unit array types */
  'u32[]' | 'i32[]' | 'float[]' | 'rgbw[]' |

/** 8-byte unit types */
  'u64' | 'i64' | 'timestamp' | 'double' |

/** 8-byte unit array types */
  'u64[]' | 'i64[]' | 'timestamp[]' | 'double[]'
