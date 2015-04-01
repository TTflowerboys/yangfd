//
//  CUTECommonMacro.h
//  currant
//
//  Created by Foster Yin on 4/1/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#ifndef currant_CUTECommonMacro_h
#define currant_CUTECommonMacro_h

#import <BBTCommonMarco.h>
#import <BBTUIMarco.h>
#import "Underscore.h"
#define _ Underscore

#define TabBarHeight                     49
#define TabBarControllerViewFrame CGRectMake(0, 0, ScreenWidth, ScreenHeight - TabBarHeight)

//http://stackoverflow.com/questions/510269/shortcuts-in-objective-c-to-concatenate-nsstrings

#define CONCAT(...) [@[__VA_ARGS__] componentsJoinedByString:@""]

#endif
