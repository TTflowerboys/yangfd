//
//  CUTEUnfinishedRentTicketViewController.h
//  currant
//
//  Created by Foster Yin on 4/22/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface CUTEUnfinishedRentTicketListViewController : UITableViewController

@property (strong, nonatomic) NSArray *unfinishedRentTickets;

- (void)refreshTable;

@end
